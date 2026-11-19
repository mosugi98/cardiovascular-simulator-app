import { searchCases, SortMode } from '../search/caseSearch.js';
import { CASES, getCase } from '../cases/index.js';
import { MODES, CHALLENGE_SIM_MIN_PER_SEC, createSim, advance, perform, finish, menuFor } from '../engine/sim.js';
import { GROUPS } from '../engine/catalog.js';
import { debrief } from '../engine/score.js';
import { createProgressStore, hasProgress, validateProgress } from '../storage/progress.js';
import { startTraces, startEcgRenderer, describeRhythm } from './ecg.js';
import { renderEcg12 } from './ecg12.js';
import { startEchoRenderer, describeEcho } from './echo.js';
import { createScene } from './patientScene.js';
import { activeAlarms, topLevel, newCallouts } from './alarms.js';
import { ask, suggestedQuestion, MAX_QUESTION_LENGTH } from './history.js';
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

/** A small line icon. The markup is fixed text in this file, never user input. */
function icon(inner) {
  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" focusable="false">${inner}</svg>`;
  return span;
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
const personLine = (c) => `${c.person.age}-year-old ${c.person.sex}`;

/* ---------- routing ---------- */
function route() {
  const [name, a, b] = location.hash.replace(/^#\/?/, '').split('/');
  const def = getCase(a);
  if (name === 'play' && def && Object.values(MODES).includes(b)) return renderPlay(def, b);
  if (name === 'case' && def) return renderIntro(def);
  return renderList();
}
window.addEventListener('hashchange', route);

/* ---------- case list: the department board ---------- */
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
    return h('li', { class: 'card', 'data-triage': String(c.triage.level) },
      h('div', { class: 'bay-no' }, `Bay ${c.person.bay}`, h('small', {}, `${c.prefix}-${c.caseNumber}`)),
      h('div', { class: 'info' },
        h('h2', { class: 'card-title' }, c.name),
        h('p', { class: 'meta' },
          h('span', {}, personLine(c)),
          h('span', {}, c.chiefComplaints.join(', ')),
          h('span', { class: 'triage' }, `Triage ${c.triage.level}: ${c.triage.label}`)),
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

  const strip = h('canvas', { 'aria-hidden': 'true' });
  show('Cardiovascular Simulator',
    h('div', { class: 'board-head' },
      h('p', {}, `${CASES.length} patients are waiting in the resus bays. Pick one, talk to them, examine them, read the monitor, order tests and treat. A scored debrief follows.`),
      strip),
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
  // The title sits in the board header, above the live rhythm strip.
  const board = root.querySelector('.board-head');
  board.prepend(root.querySelector('h1'));
  const stripRender = startEcgRenderer(strip, () => ({ rhythm: 'sinus', hr: 72, ecg: { amp: 1 } }), { seconds: 5 });
  cleanup = () => stripRender.stop();
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
    h('p', { class: 'muted small' }, `Bay ${def.person.bay}. ${def.prefix}-${def.caseNumber}. Triage ${def.triage.level}: ${def.triage.label}.`),
    notReviewed(),
    h('h2', {}, 'The probandus'),
    h('p', {}, def.patient),
    h('p', { class: 'handover' }, def.handover),
    form);
}

/* ---------- the bay ---------- */
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

const TOOLS = [
  { id: 'look', label: 'Look', mode: 'now', action: 'inspect', hint: 'You look the patient over.', svg: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' },
  { id: 'stethoscope', label: 'Stethoscope', mode: 'pick', hint: 'Stethoscope in hand. Press a listening site on the chest. Press Escape to put it down.', svg: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>' },
  { id: 'hands', label: 'Hands', mode: 'pick', hint: 'Hands ready. Press the neck or the wrist on the patient.', svg: '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 13l-2-2a1.6 1.6 0 0 0-2.3 2.2L8 19c1 1.4 2.6 2 4.4 2H14a5 5 0 0 0 5-5v-3"/>' },
  { id: 'ecg', label: 'ECG machine', mode: 'now', action: 'ecg12', hint: 'Electrodes on. The ECG is printing.', svg: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M5 13h3l2-5 3 9 2-4h4"/>' },
  { id: 'echo', label: 'Ultrasound', mode: 'now', action: 'echo', hint: 'Probe on the chest. The image is live.', svg: '<path d="M9 3h6v8l3 3v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4l3-3z"/>' },
];

function renderPlay(def, mode, { notice } = {}) {
  let s = createSim(def, mode);
  let paused = false;
  let leftPage = false;
  let rendered = 0;
  let last = performance.now();
  let tool = null;
  let echoOn = false;
  let echoFrozen = false;
  let echoRenderer = null;
  let beepOn = false;
  let silencedUntil = 0;
  let prevAlarmIds = new Set();
  let lastSpeech = '';
  const who = def.history.speaker === 'Paramedic' ? 'the paramedic' : 'the patient';

  /* monitor */
  const vitalEls = {};
  const vitalsList = h('dl', { class: 'vitals', 'aria-label': 'Patient vitals' }, VITALS.map((vd) => {
    const num = h('span', { class: 'num' });
    const stat = h('span', { class: 'stat' });
    const box = h('div', { class: 'vital', 'data-key': vd.key },
      h('dt', {}, vd.label),
      h('dd', {}, num, ' ', h('span', { class: 'unit' }, vd.unit)),
      h('dd', {}, stat));
    vitalEls[vd.key] = { box, num, stat };
    return box;
  }));
  const canvas = h('canvas', { class: 'ecg', role: 'img', 'aria-label': 'ECG trace' });
  const pleth = h('canvas', { class: 'pleth', 'aria-hidden': 'true' });
  const rhythmText = h('span', {});
  const alarmText = h('span', { class: 'alarm-text', 'aria-hidden': 'true' }, 'No alarms');
  const alarmNames = h('span', { class: 'visually-hidden' }, 'No alarms');
  const silenceBtn = h('button', { type: 'button', 'aria-pressed': 'false' }, 'Silence alarms');
  const alarmBar = h('div', { class: 'alarm-bar', role: 'status', 'aria-live': 'polite', 'data-level': 'none' }, h('span', {}, alarmText, alarmNames), silenceBtn);
  const deadBanner = h('div', { class: 'dead-banner', role: 'status', hidden: true }, 'The patient has died.');
  const clock = h('span', { class: 'clock', 'aria-label': 'Case time' });
  const logEl = h('ol', { class: 'log' });
  const logRegion = h('div', { role: 'log', 'aria-live': 'polite', 'aria-label': 'Case log' }, logEl);
  const audioStatus = h('p', { class: 'small muted', role: 'status' });
  const pauseBtn = h('button', { type: 'button', 'aria-pressed': 'false' }, 'Pause');
  const actionButtons = [];
  const toolButtons = [];
  const stripVals = Object.fromEntries(['hr', 'bp', 'spo2', 'rr'].map((k) => [k, h('b', {})]));
  const vitalsStrip = h('div', { class: 'vitals-strip', 'aria-hidden': 'true' },
    h('span', {}, 'HR ', stripVals.hr), h('span', {}, 'BP ', stripVals.bp), h('span', {}, 'SpO2 ', stripVals.spo2), h('span', {}, 'RR ', stripVals.rr));

  /* probandus and scene */
  const bubble = h('p', { class: 'bubble', 'aria-live': 'polite' });
  const hint = h('p', { class: 'hint', 'aria-live': 'polite' }, 'Pick a tool, or press a body site on the patient. Open "What do you do?" below for the full list of actions.');
  const scene = createScene(def, (z) => onSite(z));

  /* history chat */
  const chatLog = h('ol', { class: 'chat' });
  const chatRegion = h('div', { role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' }, chatLog);
  const qInput = h('input', { type: 'text', id: 'question', maxlength: String(MAX_QUESTION_LENGTH), autocomplete: 'off', placeholder: 'Type a question' });
  const askBtn = h('button', { type: 'submit', class: 'primary' }, 'Ask');
  const chatStatus = h('p', { class: 'small muted', role: 'status' });
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Suggested questions' },
    def.history.chips.map((id) => h('button', { type: 'button', class: 'chip', onClick: () => sendQuestion(suggestedQuestion(id)) }, suggestedQuestion(id))));
  const chatForm = h('form', { class: 'ask', onSubmit: (e) => { e.preventDefault(); sendQuestion(qInput.value); qInput.value = ''; } },
    h('label', { for: 'question', class: 'visually-hidden' }, `Your question to ${who}`), qInput, askBtn);

  function addChat(speaker, text, kind) {
    chatLog.append(h('li', { class: `chat-${kind}` }, h('strong', {}, `${speaker}: `), text));
    chatLog.scrollTop = chatLog.scrollHeight; // keep the latest line in view
  }
  function chatLocked() {
    if (s.status !== 'active') return 'The case has ended, so you cannot ask more questions.';
    if (paused) return 'The case is paused. Resume to ask more questions.';
    return '';
  }
  function sendQuestion(text) {
    if (chatLocked()) return;
    const r = ask(def, s, text);
    if (!r) return;
    addChat('You', r.question, 'you');
    addChat(r.speaker, r.text, r.understood ? 'them' : 'unsure');
    // A question that is not understood costs no time.
    if (r.understood) perform(def, s, 'history', { label: r.question, text: `${r.speaker}: ${r.text}` });
    update();
  }

  /* instruments */
  const paperCanvas = h('canvas', { class: 'paper', role: 'img', 'aria-label': '12-lead ECG printout' });
  const paperHeading = h('h2', {}, '12-lead ECG printout');
  const paperCaption = h('p', { class: 'caption' });
  const printout = h('section', { class: 'printout', 'aria-label': '12-lead ECG printout', hidden: true },
    h('div', { class: 'slot', 'aria-hidden': 'true' }),
    h('div', { class: 'bar' }, paperHeading, h('button', { type: 'button', onClick: () => { printout.hidden = true; syncInstruments(); } }, 'Close printout')),
    h('div', { class: 'paper-scroll', tabindex: '0', role: 'region', 'aria-label': '12-lead ECG. Scroll sideways to see every lead.' }, paperCanvas),
    paperCaption);
  const echoCanvas = h('canvas', { class: 'echo', role: 'img', 'aria-label': 'Echocardiogram' });
  const echoCaption = h('p', { class: 'caption' });
  const freezeBtn = h('button', { type: 'button', 'aria-pressed': 'false', onClick: () => {
    echoFrozen = !echoFrozen;
    freezeBtn.setAttribute('aria-pressed', String(echoFrozen));
    freezeBtn.textContent = echoFrozen ? 'Unfreeze image' : 'Freeze image';
  } }, 'Freeze image');
  const echoScreen = h('section', { class: 'echo-screen', 'aria-label': 'Echocardiogram', hidden: true },
    h('div', { class: 'bar' }, h('h2', {}, 'Echocardiogram'),
      h('span', {}, freezeBtn, ' ', h('button', { type: 'button', onClick: hideEcho }, 'Remove probe'))),
    h('div', { class: 'view' }, echoCanvas, h('span', { class: 'tag l' }, 'Apical four-chamber'), h('span', { class: 'tag r' }, 'Simulated image')),
    echoCaption);
  const instruments = h('div', { class: 'instruments', hidden: true }, printout, echoScreen);
  function syncInstruments() { instruments.hidden = printout.hidden && echoScreen.hidden; }

  function showEcg(entry) {
    const snap = entry._ecg;
    printout.hidden = false;
    syncInstruments();
    renderEcg12(paperCanvas, snap);
    paperHeading.textContent = snap.heading;
    paperCaption.textContent = entry.text;
    paperCanvas.setAttribute('aria-label', `${snap.heading}. ${entry.text}`);
    printout.classList.remove('printing');
    void printout.offsetWidth;
    printout.classList.add('printing');
    printout.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function showEcho() {
    echoOn = true;
    scene.update(s, { probeOn: true });
    echoScreen.hidden = false;
    syncInstruments();
    if (!echoRenderer) echoRenderer = startEchoRenderer(echoCanvas, () => ({ echo: def.echo(s), hr: s.vitals.hr, rhythm: s.rhythm, frozen: echoFrozen }));
    updateEchoText();
    echoScreen.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function hideEcho() {
    echoOn = false;
    echoScreen.hidden = true;
    echoRenderer?.stop();
    echoRenderer = null;
    syncInstruments();
    scene.update(s, { probeOn: false });
  }
  function updateEchoText() {
    if (!echoOn) return;
    const e = def.echo(s);
    echoCaption.textContent = e.caption;
    echoCanvas.setAttribute('aria-label', describeEcho(e));
  }

  function playSound(kind, area) {
    audioStatus.textContent = '';
    try {
      const snd = def.sounds(s, area);
      const type = kind === 'heart' ? snd.heart : snd.lungs;
      if (type === 'none') { audioStatus.textContent = kind === 'heart' ? 'No heart sounds are heard.' : 'No breath sounds are heard.'; return; }
      const secs = kind === 'heart' ? audio.playHeart(type, s.vitals.hr) : audio.playLungs(type);
      audioStatus.textContent = secs ? 'Playing simulated sound.' : 'Sounds are muted.';
    } catch (err) {
      audioStatus.textContent = 'Sound could not play in this browser. The written findings still apply.';
    }
  }

  function addLogEntry(e) {
    if (e.kind === 'history') return; // questions and answers are in the conversation
    const li = h('li', {}, h('div', { class: 'time' }, `T+${Math.floor(e.t)} min`));
    if (e.kind === 'event') {
      li.append(h('div', { class: 'event' }, e.text));
    } else {
      li.append(h('div', {}, h('strong', {}, e.label)), h('div', {}, e.text ?? ''));
      if (e.id === 'heartSounds') li.append(h('button', { type: 'button', onClick: () => playSound('heart', e._area) }, 'Play simulated heart sounds'));
      if (e.id === 'lungs') li.append(h('button', { type: 'button', onClick: () => playSound('lungs', e._area) }, 'Play simulated lung sounds'));
      if (e.id === 'ecg12' && e._ecg) li.append(h('button', { type: 'button', onClick: () => showEcg(e) }, 'View printout'));
      if (e.id === 'echo' && e._echo) li.append(h('button', { type: 'button', onClick: showEcho }, 'View echo'));
    }
    logEl.prepend(li);
  }
  function addNurse(text) {
    logEl.prepend(h('li', { class: 'nurse' }, h('div', { class: 'time' }, `T+${Math.floor(s.t)} min`), h('div', {}, text)));
  }

  function updateAlarms() {
    const now = performance.now();
    if (s.status === 'dead') {
      alarmBar.dataset.level = 'high';
      alarmBar.dataset.flash = 'false';
      alarmText.textContent = 'No pulse';
      alarmNames.textContent = 'No pulse';
      return;
    }
    const alarms = s.status === 'active' ? activeAlarms(s.vitals) : [];
    const level = topLevel(alarms);
    const silenced = now < silencedUntil;
    alarmBar.dataset.level = level ?? 'none';
    alarmBar.dataset.flash = String(!!level && !silenced);
    alarmText.textContent = alarms.length ? alarms.map((a) => a.text).join('. ') : 'No alarms';
    const names = alarms.map((a) => a.id).join(',');
    if (alarmNames.dataset.ids !== names) {
      alarmNames.dataset.ids = names;
      alarmNames.textContent = alarms.length ? `Alarm: ${alarms.map((a) => a.text.split(',')[0]).join(', ')}` : 'No alarms';
    }
    for (const line of newCallouts(prevAlarmIds, alarms)) addNurse(line);
    prevAlarmIds = new Set(alarms.map((a) => a.id));
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
    for (const k of ['hr', 'bp', 'spo2', 'rr']) stripVals[k].textContent = vitalText(k, s);
    const desc = describeRhythm(s.rhythm, s.vitals.hr, s.ecg);
    rhythmText.textContent = `Lead ${def.monitorLead}. ${desc}`;
    canvas.setAttribute('aria-label', `ECG trace. ${desc}.`);
    clock.textContent = `Time: ${Math.floor(s.t)} min${mode === MODES.CHALLENGE && paused ? ' (paused)' : ''}`;
    deadBanner.hidden = s.status !== 'dead';
    const m = scene.update(s, { probeOn: echoOn });
    const said = s.status === 'dead' ? '' : m.unresponsive ? 'unresponsive' : def.speech(s);
    if (said !== lastSpeech) {
      lastSpeech = said;
      bubble.textContent = said === 'unresponsive' ? 'The patient does not respond.' : said ? `"${said}"` : 'The patient does not respond.';
    }
    updateEchoText();
    updateAlarms();
    while (rendered < s.log.length) addLogEntry(s.log[rendered++]);
    const locked = s.status !== 'active' || paused;
    for (const b of actionButtons) b.disabled = locked;
    for (const b of toolButtons) b.disabled = locked;
    for (const z of scene.zones) z.setAttribute('aria-disabled', String(locked));
    const why = chatLocked();
    qInput.disabled = !!why;
    askBtn.disabled = !!why;
    for (const c of chips.children) c.disabled = !!why;
    chatStatus.textContent = why;
    if (s.status !== 'active') endCase();
  }

  function doAction(id, opts = {}) {
    if (paused || s.status !== 'active') return;
    const r = perform(def, s, id, opts);
    if (!r.ok) { audioStatus.textContent = r.error; update(); return; }
    if (opts.area) r.entry._area = opts.area;
    const ok = !/^The patient deteriorated/.test(r.entry.text ?? '');
    if (id === 'ecg12' && ok) {
      r.entry._ecg = { rhythm: s.rhythm, hr: s.vitals.hr, ecg: { ...s.ecg }, heading: `12-lead ECG at T+${Math.floor(r.entry.t)} min` };
      update();
      showEcg(r.entry);
      return;
    }
    if (id === 'echo' && ok) {
      r.entry._echo = true;
      update();
      showEcho();
      return;
    }
    update();
  }

  /** A body site was pressed: examine there, and show the stethoscope where it went. */
  function onSite(z) {
    if (paused || s.status !== 'active') return;
    scene.flashZone(z);
    hint.textContent = z.label;
    const base = z.action === 'heartSounds' ? 'Listen to the heart' : z.action === 'lungs' ? 'Listen to the lungs' : null;
    doAction(z.action, z.area ? { area: z.area, label: `${base}: ${z.short}` } : {});
  }

  let ended = false;
  let debriefTimer = null;
  function endCase() {
    if (ended) return;
    ended = true;
    stopAll();
    // Short pause so the learner sees the final monitor state. Leaving the case cancels it.
    debriefTimer = setTimeout(() => { debriefTimer = null; renderDebrief(def, mode, s); }, s.status === 'finished' ? 0 : 900);
  }

  const traces = startTraces(
    [{ canvas, color: '#4be38f', kind: 'ecg' }, { canvas: pleth, color: '#5ed4f0', kind: 'pleth' }],
    () => ({ rhythm: s.rhythm, hr: s.vitals.hr, ecg: s.ecg, pulsePressure: s.vitals.sbp - s.vitals.dbp }),
    {
      onBeat: () => {
        if (beepOn && s.status === 'active') audio.beep(440 + Math.max(0, Math.min(20, s.vitals.spo2 - 80)) * 18, 0.07, 0.1);
      },
    },
  );
  const timer = mode === MODES.CHALLENGE ? setInterval(() => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (!paused && s.status === 'active' && !document.hidden) {
      advance(def, s, Math.min(dt, 1) * CHALLENGE_SIM_MIN_PER_SEC);
      update();
    }
  }, 200) : null;
  const alarmTimer = setInterval(() => {
    if (!beepOn || s.status !== 'active' || paused) return;
    const level = topLevel(activeAlarms(s.vitals));
    if (level && performance.now() >= silencedUntil) audio.beep(level === 'high' ? 1175 : 784, level === 'high' ? 0.22 : 0.14, 0.08);
  }, 2000);

  // Escape puts the stethoscope (or hands) down.
  function onKey(e) { if (e.key === 'Escape' && tool) putToolDown(); }
  document.addEventListener('keydown', onKey);

  let monitorWatch = null;

  function stopAll() {
    traces.stop();
    echoRenderer?.stop();
    echoRenderer = null;
    if (timer) clearInterval(timer);
    clearInterval(alarmTimer);
    if (debriefTimer) { clearTimeout(debriefTimer); debriefTimer = null; }
    monitorWatch?.disconnect();
    audio.stop();
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('keydown', onKey);
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
  silenceBtn.addEventListener('click', () => {
    const on = performance.now() >= silencedUntil;
    silencedUntil = on ? performance.now() + 60000 : 0;
    silenceBtn.setAttribute('aria-pressed', String(on));
    silenceBtn.textContent = on ? 'Alarms silenced for 1 minute' : 'Silence alarms';
    updateAlarms();
  });

  const muteBtn = h('button', { type: 'button', 'aria-pressed': String(audio.muted), onClick: () => {
    audio.setMuted(!audio.muted);
    muteBtn.setAttribute('aria-pressed', String(audio.muted));
    muteBtn.textContent = audio.muted ? 'Unmute sounds' : 'Mute sounds';
  } }, audio.muted ? 'Unmute sounds' : 'Mute sounds');
  const beepBtn = h('button', { type: 'button', 'aria-pressed': 'false', onClick: () => {
    beepOn = !beepOn;
    beepBtn.setAttribute('aria-pressed', String(beepOn));
    beepBtn.textContent = beepOn ? 'Monitor beeps: on' : 'Monitor beeps: off';
    if (beepOn) audio.beep(660, 0.08, 0.1);
  } }, 'Monitor beeps: off');

  /* tool tray */
  function putToolDown() {
    tool = null;
    toolButtons.filter((b) => b.dataset.tool).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    scene.setTool(null);
    hint.textContent = 'Tool put down. Pick a tool, or press a body site.';
  }
  const tray = h('div', { class: 'tray', role: 'group', 'aria-label': 'Examination tools' }, TOOLS.map((t) => {
    const btn = h('button', { type: 'button', class: 'tool', 'aria-pressed': t.mode === 'pick' ? 'false' : null, onClick: () => {
      if (t.mode === 'now') { if (tool) putToolDown(); hint.textContent = t.hint; doAction(t.action); return; }
      if (tool === t.id) { putToolDown(); return; }
      tool = t.id;
      toolButtons.filter((b) => b.dataset.tool).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
      scene.setTool(tool);
      hint.textContent = t.hint;
    } }, icon(t.svg), h('span', {}, t.label));
    if (t.mode === 'pick') btn.dataset.tool = t.id;
    toolButtons.push(btn);
    return btn;
  }));

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

  const probandus = h('section', { class: 'probandus', 'data-triage': String(def.triage.level), 'aria-label': 'Probandus' },
    h('h2', {}, 'Probandus'),
    h('p', { class: 'who' }, h('strong', {}, personLine(def)), `, bay ${def.person.bay}. Triage ${def.triage.level}: ${def.triage.label}.`),
    h('p', { class: 'small' }, def.handover),
    bubble);
  const monitor = h('section', { class: 'monitor', 'aria-label': 'Patient monitor' },
    alarmBar,
    h('div', { class: 'monitor-body' },
      vitalsList,
      h('div', { class: 'traces' },
        h('div', { class: 'trace' }, h('div', { class: 'trace-label ecg' }, h('span', {}, 'ECG'), rhythmText), canvas),
        h('div', { class: 'trace' }, h('div', { class: 'trace-label pleth' }, h('span', {}, 'SpO2 pulse wave')), pleth))),
    deadBanner);

  show(def.name,
    h('div', { class: 'topbar' },
      h('div', { class: 'group' },
        h('span', { class: 'badge' }, mode === MODES.LEARNING ? 'Learning mode' : 'Challenge mode'),
        clock),
      h('div', { class: 'group' },
        mode === MODES.CHALLENGE ? pauseBtn : null,
        muteBtn,
        beepBtn,
        h('button', { type: 'button', class: 'danger', onClick: () => { finish(def, s); update(); } }, 'Finish case'),
        h('button', { type: 'button', onClick: () => { stopAll(); location.hash = '#/'; } }, 'Leave case'))),
    notice ? h('p', { class: 'notice info', role: 'alert' }, notice) : null,
    notReviewed(),
    h('div', { class: 'strip-anchor' }, vitalsStrip),
    h('div', { class: 'bay' },
      h('div', { class: 'station' },
        h('div', { class: 'station-left' },
          h('section', { class: 'scene-wrap', 'aria-label': 'Patient' }, scene.el),
          h('div', { class: 'tray-wrap' }, tray, hint)),
        h('div', { class: 'station-right' }, monitor, probandus)),
      instruments,
      h('div', { class: 'workbench' },
        // The full list of actions stays closed until the learner opens it. The tools, the body sites and the
        // conversation work without it.
        h('details', { class: 'panel orders' },
          h('summary', {}, h('h2', {}, 'What do you do?')),
          h('div', { class: 'orders-body' }, groups)),
        h('section', { class: 'panel findings', 'aria-label': 'Findings' }, h('h2', {}, 'Findings'), audioStatus,
          h('p', { class: 'small muted' }, 'Heart and lung sounds are simulated in your browser. They are approximations, not recordings.'), logRegion),
        h('section', { class: 'panel history', 'aria-label': 'History' }, h('h2', {}, 'History'),
          h('p', { class: 'small muted' }, `You are talking to ${who}. Type a question, or pick one.`),
          chips, chatForm, chatStatus, chatRegion))));

  // The compact vitals strip appears only while the monitor is off screen.
  if ('IntersectionObserver' in window) {
    monitorWatch = new IntersectionObserver(([entry]) => { vitalsStrip.classList.toggle('show', !entry.isIntersecting); });
    monitorWatch.observe(monitor);
  }
  cleanup = () => { stopAll(); };
  update();
}

/* ---------- debrief ---------- */
const RATING_LABEL = { helpful: 'Helpful', harmful: 'Harmful', neutral: 'No effect' };

function renderDebrief(def, mode, s) {
  const d = debrief(def, s);
  store.recordResult(def.id, s.status, d.score);

  const item = (e) => h('li', { 'data-rating': e.rating },
    h('div', {}, h('strong', {}, e.label), h('span', { class: `tag ${e.rating}` }, RATING_LABEL[e.rating]), h('span', { class: 'muted small' }, `  at ${Math.floor(e.t)} min`)),
    h('div', { class: 'small' }, e.why),
    e.source ? h('div', { class: 'source' }, e.source) : null);

  // Questions are grouped into one line that opens to show the conversation.
  const questions = d.timeline.filter((e) => e.kind === 'history');
  const actions = d.timeline.filter((e) => e.kind !== 'history');
  const historyItem = questions.length ? h('li', { 'data-rating': 'neutral', class: 'history-group' },
    h('details', {},
      h('summary', {}, `History: ${questions.length} ${questions.length === 1 ? 'question' : 'questions'} asked`),
      h('ul', { class: 'history-list' }, questions.map((q) => h('li', {}, h('strong', {}, `${q.label} `), h('span', { class: 'muted' }, `(at ${Math.floor(q.t)} min)`), h('div', { class: 'small' }, q.text)))),
      h('div', { class: 'small muted' }, 'Taking a history is part of every assessment. It is not scored.'))) : null;
  const timeline = h('ol', { class: 'timeline' }, historyItem, actions.map(item));

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
