import { searchCases, SortMode } from '../search/caseSearch.js';
import { CASES, getCase } from '../cases/index.js';
import { MODES, CHALLENGE_SIM_MIN_PER_SEC, createSim, advance, perform, finish, menuFor } from '../engine/sim.js';
import { GROUPS } from '../engine/catalog.js';
import { debrief } from '../engine/score.js';
import { createProgressStore, hasProgress, validateProgress } from '../storage/progress.js';
import { startEcgRenderer, describeRhythm } from './ecg.js';
import { createAudio } from './audio.js';

const NOT_REVIEWED = 'Educational demo. The clinical content has not been clinically reviewed. Do not use it for real patient care.';

const store = createProgressStore({ knownCaseIds: CASES.map((c) => c.id) });
const audio = createAudio();
const root = document.getElementById('app');
let cleanup = () => {};

/* ---------- tiny DOM helper ---------- */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

function show(titleText, ...content) {
  cleanup();
  cleanup = () => {};
  const heading = h('h1', { tabindex: '-1' }, titleText);
  root.replaceChildren(h('main', {}, heading, ...content));
  document.title = `${titleText} | Cardiovascular Simulator`;
  heading.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

const notReviewed = () => h('p', { class: 'notice', role: 'note' }, NOT_REVIEWED);

/* ---------- routing ---------- */
function route() {
  const [name, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  const def = getCase(a);
  if (name === 'play' && def && Object.values(MODES).includes(b)) return renderPlay(def, b);
  if (name === 'case' && def) return renderIntro(def);
  return renderList();
}
window.addEventListener('hashchange', route);

/* ---------- case list ---------- */
const listState = { query: '', sort: SortMode.CaseNumber, favoritesOnly: false };

function renderList() {
  const status = h('p', { role: 'status', 'aria-live': 'polite', class: 'small' });
  const listEl = h('ul', { class: 'cards' });
  const emptyEl = h('div', { class: 'empty', role: 'status', hidden: true }, h('strong', {}, 'No search results'), 'Try another term.');

  const input = h('input', { type: 'search', id: 'q', value: listState.query, placeholder: 'Search cases', autocomplete: 'off', 'aria-label': 'Search cases' });
  const clearBtn = h('button', { type: 'button', class: 'clear', 'aria-label': 'Clear search', hidden: true }, '×');
  const sortSel = h('select', { 'aria-label': 'Sort cases' },
    h('option', { value: SortMode.CaseNumber }, 'Case number'),
    h('option', { value: SortMode.RecentlyPlayed }, 'Recently played'),
    h('option', { value: SortMode.Name }, 'Name'));
  sortSel.value = listState.sort;
  const favBox = h('input', { type: 'checkbox', id: 'favs' });
  favBox.checked = listState.favoritesOnly;

  function draw() {
    listState.query = input.value;
    listState.sort = sortSel.value;
    listState.favoritesOnly = favBox.checked;
    clearBtn.hidden = input.value.length === 0;
    const records = CASES.map((c) => ({ ...c, lastPlayed: store.data.cases[c.id]?.lastPlayed }));
    const { results } = searchCases(records, {
      query: input.value,
      sort: sortSel.value,
      favoriteIds: favBox.checked ? store.data.favorites : undefined,
    });
    listEl.replaceChildren(...results.map(caseCard));
    emptyEl.hidden = results.length > 0;
    if (results.length === 0 && favBox.checked && !input.value.trim()) {
      emptyEl.replaceChildren(h('strong', {}, 'No favorites yet'), 'Use the star on a case to add it.');
    } else {
      emptyEl.replaceChildren(h('strong', {}, 'No search results'), 'Try another term.');
    }
  }

  function clearSearch() { input.value = ''; draw(); input.focus(); }
  input.addEventListener('input', draw);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearSearch(); });
  clearBtn.addEventListener('click', clearSearch);
  sortSel.addEventListener('change', draw);
  favBox.addEventListener('change', draw);

  function caseCard(c) {
    const rec = store.data.cases[c.id];
    const fav = store.isFavorite(c.id);
    const progress = rec
      ? `Best score ${rec.bestScore}. Played ${rec.attempts} ${rec.attempts === 1 ? 'time' : 'times'}. Last result: ${rec.lastOutcome}.`
      : 'Not played yet.';
    const star = h('button', {
      type: 'button', 'aria-pressed': String(fav), 'aria-label': `Favorite: ${c.name}`,
      onClick: () => { store.toggleFavorite(c.id); draw(); },
    }, fav ? '★' : '☆');
    return h('li', { class: 'card' },
      h('div', { class: 'info' },
        h('h3', {}, c.name),
        h('p', { class: 'muted small' }, `${c.prefix}-${c.caseNumber} · ${c.categories.join(', ')} · ${c.chiefComplaints.join(', ')}`),
        h('p', { class: 'small' }, progress)),
      h('div', { class: 'actions' }, star,
        h('button', { type: 'button', class: 'primary', onClick: () => { location.hash = `#/case/${c.id}`; } }, `Open ${c.name}`)));
  }

  const fileInput = h('input', { type: 'file', accept: '.json,application/json', class: 'visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    let text;
    try { text = await file.text(); } catch { status.textContent = 'Could not read that file.'; return; }
    let parsed;
    try { parsed = JSON.parse(text); } catch { status.textContent = 'Import failed: the file is not valid JSON. Your progress was not changed.'; return; }
    const check = validateProgress(parsed, CASES.map((c) => c.id));
    if (!check.ok) { status.textContent = `Import failed: ${check.error} Your progress was not changed.`; return; }
    if (hasProgress(store.data) && !window.confirm('Replace your saved progress with the contents of this file?')) {
      status.textContent = 'Import cancelled. Your progress was not changed.';
      return;
    }
    store.importText(text);
    draw();
    status.textContent = 'Progress imported.';
  });

  function exportProgress() {
    const blob = new Blob([store.exportText()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: 'cardiovascular-simulator-progress.json' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Progress file downloaded.';
  }

  show('Cardiovascular Simulator',
    h('p', { class: 'muted' }, 'Practise four cardiovascular emergencies. Read the monitor, examine the patient, order tests, give treatments and review a scored debrief.'),
    notReviewed(),
    store.persistent ? null : h('p', { class: 'notice error', role: 'alert' }, 'Your browser is blocking storage, so your progress will not be remembered. You can still play every case.'),
    h('div', { class: 'toolbar' },
      h('div', { class: 'field' }, input, clearBtn),
      sortSel,
      h('label', { class: 'check', for: 'favs' }, favBox, 'Favorites only')),
    listEl, emptyEl,
    h('div', { class: 'footer-tools' },
      h('button', { type: 'button', onClick: exportProgress }, 'Export progress'),
      h('button', { type: 'button', onClick: () => fileInput.click() }, 'Import progress'),
      fileInput, status));
  draw();
}

/* ---------- choose a mode ---------- */
function renderIntro(def) {
  const radio = (value, title, text, checked) => h('label', { class: 'choice' },
    h('input', { type: 'radio', name: 'mode', value, checked }),
    h('span', {}, h('strong', {}, title), h('br'), h('span', { class: 'muted' }, text)));
  const form = h('form', { onSubmit: (e) => {
    e.preventDefault();
    const mode = new FormData(form).get('mode');
    location.hash = `#/play/${def.id}/${mode}`;
  } },
  h('fieldset', {},
    h('legend', {}, 'Choose a mode'),
    radio(MODES.LEARNING, 'Learning mode', 'Turn-based. Time moves only when you act, and each action costs minutes. Calmer, and best for first attempts.', true),
    radio(MODES.CHALLENGE, 'Challenge mode', 'Real-time. A clock runs and the patient changes as you think. Delays hurt the patient. You can pause.', false)),
  h('div', { class: 'row-actions' },
    h('button', { type: 'submit', class: 'primary' }, 'Start case'),
    h('button', { type: 'button', onClick: () => { location.hash = '#/'; } }, 'Back to cases')));

  show(def.name,
    h('p', { class: 'muted small' }, `${def.prefix}-${def.caseNumber} · ${def.categories.join(', ')}`),
    notReviewed(),
    h('h2', {}, 'The patient'),
    h('p', {}, def.patient),
    form);
}

/* ---------- play ---------- */
const VITALS = [
  { key: 'hr', label: 'Heart rate', unit: '/min', status: (v) => (v < 60 ? 'Low' : v > 100 ? 'High' : 'Normal') },
  { key: 'bp', label: 'Blood pressure', unit: 'mmHg', status: (_, s) => (s.vitals.sbp < 90 ? 'Low' : s.vitals.sbp >= 140 ? 'High' : 'Normal') },
  { key: 'spo2', label: 'Oxygen (SpO2)', unit: '%', status: (v) => (v < 92 ? 'Low' : 'Normal') },
  { key: 'rr', label: 'Breathing rate', unit: '/min', status: (v) => (v < 12 ? 'Low' : v > 20 ? 'High' : 'Normal') },
  { key: 'temp', label: 'Temperature', unit: '°C', status: (v) => (v < 36 ? 'Low' : v > 38 ? 'High' : 'Normal') },
];

function vitalText(key, s) {
  const v = s.vitals;
  if (key === 'bp') return `${Math.round(v.sbp)}/${Math.round(v.dbp)}`;
  if (key === 'temp') return v.temp.toFixed(1);
  return String(Math.round(v[key]));
}

function renderPlay(def, mode, { notice } = {}) {
  let s = createSim(def, mode);
  let paused = false;
  let leftPage = false;
  let rendered = 0;
  let last = performance.now();

  const vitalEls = {};
  const vitalsList = h('dl', { class: 'vitals', 'aria-label': 'Patient vitals' }, VITALS.map((vd) => {
    const num = h('span', { class: 'num' });
    const stat = h('span', { class: 'stat' });
    const box = h('div', { class: 'vital' },
      h('dt', {}, vd.label),
      h('dd', {}, num, ' ', h('span', { class: 'unit' }, vd.unit)),
      h('dd', {}, stat));
    vitalEls[vd.key] = { box, num, stat };
    return box;
  }));
  const canvas = h('canvas', { class: 'ecg', role: 'img', 'aria-label': 'ECG trace' });
  const rhythmText = h('span', {});
  const deadBanner = h('div', { class: 'dead-banner', role: 'status', hidden: true }, 'The patient has died.');
  const clock = h('span', { class: 'clock', 'aria-label': 'Case time' });
  const logEl = h('ol', { class: 'log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Case log' });
  const audioStatus = h('p', { class: 'small muted', role: 'status' });
  const pauseBtn = h('button', { type: 'button', 'aria-pressed': 'false' }, 'Pause');
  const actionButtons = [];

  function playSound(kind) {
    audioStatus.textContent = '';
    try {
      const snd = def.sounds(s);
      const secs = kind === 'heart' ? audio.playHeart(snd.heart, s.vitals.hr) : audio.playLungs(snd.lungs);
      audioStatus.textContent = secs ? 'Playing simulated sound.' : 'Sounds are muted.';
    } catch (err) {
      audioStatus.textContent = 'Sound could not play in this browser. The written findings still apply.';
    }
  }

  function addLogEntry(e) {
    const li = h('li', {}, h('div', { class: 'time' }, `T+${Math.floor(e.t)} min`));
    if (e.kind === 'event') {
      li.append(h('div', { class: 'event' }, e.text));
    } else {
      li.append(h('div', {}, h('strong', {}, e.label)), h('div', {}, e.text ?? ''));
      if (e.id === 'heartSounds') li.append(h('button', { type: 'button', onClick: () => playSound('heart') }, 'Play simulated heart sounds'));
      if (e.id === 'lungs') li.append(h('button', { type: 'button', onClick: () => playSound('lungs') }, 'Play simulated lung sounds'));
    }
    logEl.prepend(li);
  }

  function update() {
    for (const vd of VITALS) {
      const text = vitalText(vd.key, s);
      const st = vd.status(Number(text.split('/')[0]), s);
      const el = vitalEls[vd.key];
      el.num.textContent = text;
      el.stat.textContent = st;
      el.box.dataset.state = st;
    }
    const desc = describeRhythm(s.rhythm, s.vitals.hr, s.ecg);
    rhythmText.textContent = desc;
    canvas.setAttribute('aria-label', `ECG trace. ${desc}.`);
    clock.textContent = `Time: ${Math.floor(s.t)} min${mode === MODES.CHALLENGE && paused ? ' (paused)' : ''}`;
    deadBanner.hidden = s.status !== 'dead';
    while (rendered < s.log.length) addLogEntry(s.log[rendered++]);
    const locked = s.status !== 'active' || paused;
    for (const b of actionButtons) b.disabled = locked;
    if (s.status !== 'active') endCase();
  }

  function doAction(id) {
    if (paused || s.status !== 'active') return;
    const r = perform(def, s, id);
    if (!r.ok) audioStatus.textContent = r.error;
    update();
  }

  let ended = false;
  function endCase() {
    if (ended) return;
    ended = true;
    stopAll();
    setTimeout(() => renderDebrief(def, mode, s), s.status === 'finished' ? 0 : 900);
  }

  const ecg = startEcgRenderer(canvas, () => ({ rhythm: s.rhythm, hr: s.vitals.hr, ecg: s.ecg }));
  const timer = mode === MODES.CHALLENGE ? setInterval(() => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (!paused && s.status === 'active' && !document.hidden) {
      advance(def, s, Math.min(dt, 1) * CHALLENGE_SIM_MIN_PER_SEC);
      update();
    }
  }, 200) : null;

  function stopAll() {
    ecg.stop();
    if (timer) clearInterval(timer);
    audio.stop();
    document.removeEventListener('visibilitychange', onVisibility);
  }

  // Leaving the page mid-case restarts the case from the beginning.
  function onVisibility() {
    if (s.status !== 'active') return;
    if (document.hidden) leftPage = true;
    else if (leftPage) renderPlay(def, mode, { notice: 'The case restarted because you left the page.' });
  }
  document.addEventListener('visibilitychange', onVisibility);

  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    last = performance.now();
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    pauseBtn.setAttribute('aria-pressed', String(paused));
    update();
  });

  const muteBtn = h('button', { type: 'button', 'aria-pressed': String(audio.muted), onClick: () => {
    audio.setMuted(!audio.muted);
    muteBtn.setAttribute('aria-pressed', String(audio.muted));
    muteBtn.textContent = audio.muted ? 'Unmute sounds' : 'Mute sounds';
  } }, audio.muted ? 'Unmute sounds' : 'Mute sounds');

  const groups = GROUPS.map((g) => {
    const items = menuFor(mode).filter((a) => a.group === g);
    const observe = menuFor(mode).filter((a) => a.group === 'Observe');
    const all = g === 'Examine' ? [...observe, ...items] : items;
    return h('details', { open: true },
      h('summary', {}, g),
      h('div', { class: 'btn-grid' }, all.map((a) => {
        const btn = h('button', { type: 'button', onClick: () => doAction(a.id) },
          h('span', {}, a.label),
          mode === MODES.LEARNING ? h('span', { class: 'cost' }, `+${a.cost} min`) : null);
        actionButtons.push(btn);
        return btn;
      })));
  });

  show(def.name,
    h('div', { class: 'topbar' },
      h('div', { class: 'group' },
        h('span', { class: 'badge' }, mode === MODES.LEARNING ? 'Learning mode' : 'Challenge mode'),
        clock),
      h('div', { class: 'group' },
        mode === MODES.CHALLENGE ? pauseBtn : null,
        muteBtn,
        h('button', { type: 'button', class: 'danger', onClick: () => { finish(def, s); update(); } }, 'Finish case'),
        h('button', { type: 'button', onClick: () => { stopAll(); location.hash = '#/'; } }, 'Leave case'))),
    notice ? h('p', { class: 'notice info', role: 'alert' }, notice) : null,
    notReviewed(),
    h('p', {}, def.patient),
    h('section', { class: 'monitor', 'aria-label': 'Patient monitor' },
      vitalsList,
      h('div', { class: 'ecg-wrap' },
        h('div', { class: 'ecg-label' }, h('span', {}, `ECG, lead ${def.monitorLead}`), rhythmText),
        canvas),
      deadBanner),
    h('div', { class: 'layout' },
      h('section', { class: 'panel', 'aria-label': 'Actions' }, h('h2', { style: 'margin-top:0' }, 'What do you do?'), groups, audioStatus,
        h('p', { class: 'small muted' }, 'Heart and lung sounds are simulated in your browser. They are approximations, not recordings.')),
      h('section', { class: 'panel findings', 'aria-label': 'Findings' }, h('h2', { style: 'margin-top:0' }, 'Findings'), logEl)));

  cleanup = () => { stopAll(); };
  update();
}

/* ---------- debrief ---------- */
const RATING_LABEL = { helpful: 'Helpful', harmful: 'Harmful', neutral: 'No effect' };

function renderDebrief(def, mode, s) {
  const d = debrief(def, s);
  store.recordResult(def.id, s.status, d.score);

  const timeline = h('ol', { class: 'timeline' }, d.timeline.map((e) => h('li', { 'data-rating': e.rating },
    h('div', {}, h('strong', {}, e.label), h('span', { class: `tag ${e.rating}` }, RATING_LABEL[e.rating]), h('span', { class: 'muted small' }, `  at ${Math.floor(e.t)} min`)),
    h('div', { class: 'small' }, e.why),
    e.source ? h('div', { class: 'source' }, e.source) : null)));

  const late = d.keyResults.filter((k) => k.status === 'late');
  const missed = d.missed;

  show(d.outcome,
    notReviewed(),
    h('p', {}, d.reason),
    h('p', { class: 'score', 'aria-label': `Score ${d.score} out of 100` }, `Score: ${d.score} / 100`),
    h('p', { class: 'muted small' },
      `Key actions ${d.breakdown.keyScore} of 70. Outcome ${d.breakdown.outcomeScore} of 30. Harmful actions: minus ${d.breakdown.harmPenalty} (${d.breakdown.harmCount} ${d.breakdown.harmCount === 1 ? 'action' : 'actions'}).`),
    h('h2', {}, 'Your timeline'),
    d.timeline.length ? timeline : h('p', { class: 'muted' }, 'You did not take any actions.'),
    missed.length ? h('div', {}, h('h2', {}, 'Missed key actions'),
      h('ul', { class: 'timeline' }, missed.map((k) => h('li', { 'data-rating': 'harmful' },
        h('div', {}, h('strong', {}, k.label), h('span', { class: 'tag missed' }, 'Missed')),
        h('div', { class: 'small' }, k.why),
        k.source ? h('div', { class: 'source' }, k.source) : null)))) : null,
    late.length ? h('div', {}, h('h2', {}, 'Done, but late'),
      h('ul', { class: 'timeline' }, late.map((k) => h('li', { 'data-rating': 'neutral' },
        h('div', {}, h('strong', {}, k.label), h('span', { class: 'tag late' }, 'Late'), h('span', { class: 'muted small' }, `  done at ${Math.floor(k.at)} min, aim for ${k.deadline} min`)),
        h('div', { class: 'small' }, k.why))))) : null,
    h('div', { class: 'row-actions' },
      h('button', { type: 'button', class: 'primary', onClick: () => renderPlay(def, mode) }, 'Play again'),
      h('button', { type: 'button', onClick: () => { location.hash = '#/'; } }, 'Back to cases')));
}

route();
