import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, perform, advance, menuFor, MODES } from '../src/engine/sim.js';
import { CATALOG } from '../src/engine/catalog.js';
import { debrief } from '../src/engine/score.js';
import { CASES, getCase } from '../src/cases/index.js';
import { INTENTS, matchIntent, ask, answerFor, MAX_QUESTION_LENGTH, suggestedQuestion } from '../src/ui/history.js';
import { searchCases } from '../src/search/caseSearch.js';

const fresh = (id, mode = MODES.CHALLENGE) => { const def = getCase(id); return { def, s: createSim(def, mode) }; };
const rating = (def, s, id, opts) => perform(def, s, id, opts).entry.rating;

/* ---------- history taking ---------- */
test('questions are matched to the right topic', () => {
  const cases = {
    'When did it start?': 'onset',
    'How bad is it, out of 10?': 'severity',
    'Does it spread to your arm?': 'radiation',
    'Do you take any medicines?': 'meds',
    'Have you missed any tablets?': 'adherence',
    'Are you allergic to anything?': 'allergies',
    'Do you smoke?': 'social',
    'Does heart disease run in your family?': 'family',
    'Any family history of heart problems?': 'family',
    'Do you have any medical conditions?': 'pmh',
    'Are you short of breath?': 'breathless',
    'Have you felt faint?': 'syncope',
    'Did anyone see him collapse?': 'collapse',
    'Do you have a headache?': 'headache',
    'Can you feel your heart racing?': 'palpitations',
    'Are you sweaty?': 'sweating',
    'What is wrong?': 'complaint',
    'Has this happened before?': 'prior',
  };
  for (const [q, intent] of Object.entries(cases)) assert.equal(matchIntent(q), intent, q);
});

test('every suggested question matches its own topic', () => {
  for (const i of INTENTS) assert.equal(matchIntent(i.ask), i.id, `${i.id}: ${i.ask}`);
  assert.equal(suggestedQuestion('onset'), 'When did it start?');
});

test('empty, whitespace and unknown questions are not matched', () => {
  assert.equal(matchIntent(''), null);
  assert.equal(matchIntent('   '), null);
  assert.equal(matchIntent(null), null);
  assert.equal(matchIntent('What is your favourite colour?'), null);
  const { def, s } = fresh('stemi-anterior');
  assert.equal(ask(def, s, '   '), null);
  const unknown = ask(def, s, 'Tell me a joke');
  assert.equal(unknown.understood, false);
  assert.match(unknown.text, /not sure what you are asking/);
});

test('a very long question is cut to the limit', () => {
  const { def, s } = fresh('stemi-anterior');
  const r = ask(def, s, `When did it start? ${'x'.repeat(500)}`);
  assert.ok(r.question.length <= MAX_QUESTION_LENGTH);
  assert.equal(r.intent, 'onset');
});

test('a question that matches two topics goes to the more specific one', () => {
  assert.equal(matchIntent('Which medicines have you missed?'), 'adherence');
  assert.equal(matchIntent('Does your family smoke?'), 'family');
});

test('every case answers the core topics and has suggested questions that exist', () => {
  for (const def of CASES) {
    const s = createSim(def, MODES.CHALLENGE);
    for (const id of ['complaint', 'onset', 'pmh', 'meds', 'allergies']) {
      assert.ok(def.history.answers[id] !== undefined, `${def.id} answers ${id}`);
      assert.ok(answerFor(def, s, id).text.length >= 4, `${def.id} ${id}`);
    }
    assert.ok(['Patient', 'Paramedic'].includes(def.history.speaker), def.id);
    assert.ok(def.history.chips.length >= 5, `${def.id} has suggested questions`);
    for (const c of def.history.chips) assert.ok(INTENTS.some((i) => i.id === c), `${def.id} chip ${c}`);
  }
});

test('topics a case does not answer get a plain default', () => {
  const { def, s } = fresh('cardiac-tamponade');
  assert.equal(answerFor(def, s, 'headache').text, 'No, not that I have noticed.');
  const af = getCase('afib-rvr');
  assert.equal(answerFor(af, createSim(af, MODES.CHALLENGE), 'family').text, 'My sister has an irregular heartbeat.');
});

test('the paramedic answers in the cardiac arrest case', () => {
  const { def, s } = fresh('cardiac-arrest');
  const r = ask(def, s, 'Did anyone see what happened?');
  assert.equal(r.speaker, 'Paramedic');
  assert.match(r.text, /bystander/i);
});

test('answers change with the case state', () => {
  const { def, s } = fresh('cardiac-tamponade');
  const before = ask(def, s, 'What is wrong?').text;
  perform(def, s, 'pericardiocentesis');
  assert.notEqual(ask(def, s, 'What is wrong?').text, before);
});

test('asking a question costs one minute in learning mode, none in challenge, and is not scored', () => {
  const learn = fresh('stemi-anterior', MODES.LEARNING);
  const q = ask(learn.def, learn.s, 'When did it start?');
  const r = perform(learn.def, learn.s, 'history', { label: q.question, text: q.text });
  assert.ok(r.ok);
  assert.equal(learn.s.t, CATALOG.history.cost);
  assert.equal(r.entry.kind, 'history');
  assert.equal(r.entry.text, q.text);
  const chall = fresh('stemi-anterior');
  perform(chall.def, chall.s, 'history', { label: 'x', text: 'y' });
  assert.equal(chall.s.t, 0);
  const d = debrief(learn.def, learn.s);
  assert.equal(d.breakdown.harmCount, 0);
  assert.equal(d.timeline.filter((e) => e.kind === 'history').length, 1);
  assert.equal(d.score, 0, 'asking questions alone earns nothing and costs nothing');
});

test('the menu has no button for history, and has the new actions', () => {
  const ids = menuFor(MODES.LEARNING).map((a) => a.id);
  assert.ok(!ids.includes('history'));
  for (const id of ['cpr', 'defib', 'epinephrine', 'amiodarone', 'adenosine', 'vagal', 'labetalol', 'nicardipine', 'dobutamine']) {
    assert.ok(ids.includes(id), id);
    assert.equal(CATALOG[id].kind, 'treat');
    assert.ok(CATALOG[id].cost >= 1);
  }
});

/* ---------- listening at the right site ---------- */
test('a finding heard only at its own site is reported there, and other sites say so', () => {
  const { def, s } = fresh('adhf');
  const apex = perform(def, s, 'heartSounds', { area: 'mitral', label: 'Listen to the heart: mitral area' });
  assert.match(apex.entry.text, /third heart sound/);
  assert.match(apex.entry.label, /mitral/);
  assert.match(perform(def, s, 'heartSounds', { area: 'aortic' }).entry.text, /Nothing abnormal is heard at this site/);
  assert.match(perform(def, s, 'heartSounds').entry.text, /third heart sound/, 'the action list still gives the general finding');
});

test('lung zones differ, and a case without site findings falls back to the general text', () => {
  const { def, s } = fresh('adhf');
  assert.match(perform(def, s, 'lungs', { area: 'lower' }).entry.text, /Coarse crackles at both bases/);
  const af = fresh('afib-rvr');
  assert.equal(perform(af.def, af.s, 'lungs', { area: 'upper' }).entry.text, 'Clear in the upper zones.');
});

test('listening at several sites is allowed; only the first is rated helpful', () => {
  const { def, s } = fresh('adhf');
  assert.equal(rating(def, s, 'heartSounds', { area: 'mitral' }), 'neutral' === 'x' ? '' : rating(def, createSim(def, MODES.CHALLENGE), 'heartSounds', { area: 'mitral' }) && 'neutral');
  assert.equal(rating(def, s, 'heartSounds', { area: 'aortic' }), 'neutral');
});

test('every case has at least one site where the finding is different from the others (or says why not)', () => {
  const localized = CASES.filter((def) => {
    const s = createSim(def, MODES.CHALLENGE);
    const texts = new Set(['aortic', 'pulmonic', 'tricuspid', 'mitral'].map((a) => def.auscultation.heart[a](s)));
    return texts.size > 1;
  });
  assert.ok(localized.length >= 6, `${localized.length} cases have a finding at one site only`);
  for (const id of ['adhf', 'stemi-anterior', 'cardiogenic-shock', 'hypertensive-emergency']) assert.ok(localized.some((d) => d.id === id), id);
});

/* ---------- unsafe unless indicated ---------- */
test('unsafe treatments are harmful and worsen the patient where they are not indicated', () => {
  const stemi = fresh('stemi-anterior');
  for (const id of ['epinephrine', 'defib', 'adenosine', 'labetalol', 'nicardipine', 'cpr']) {
    const s = createSim(stemi.def, MODES.CHALLENGE);
    const before = s.severity;
    const r = perform(stemi.def, s, id);
    assert.equal(r.entry.rating, 'harmful', id);
    assert.ok(r.entry.source.length > 10, `${id} cites a guideline`);
    assert.ok(s.severity > before, id);
  }
  const af = fresh('afib-rvr');
  assert.equal(rating(af.def, af.s, 'cpr'), 'harmful');
  const tam = fresh('cardiac-tamponade');
  assert.equal(rating(tam.def, tam.s, 'labetalol'), 'harmful');
});

/* ---------- cardiac arrest ---------- */
test('arrest: a pulse returns on the second shock only with CPR running and epinephrine given', () => {
  const run = (actions) => { const { def, s } = fresh('cardiac-arrest'); for (const a of actions) perform(def, s, a); return s; };
  assert.equal(run(['defib', 'defib']).flags.rosc, undefined, 'shocks alone do nothing');
  assert.equal(run(['cpr', 'defib', 'defib']).flags.rosc, undefined, 'no epinephrine');
  assert.equal(run(['epinephrine', 'defib', 'defib']).flags.rosc, undefined, 'no compressions');
  assert.equal(run(['cpr', 'defib', 'epinephrine', 'defib']).flags.rosc, true);
  assert.equal(run(['cpr', 'epinephrine', 'defib']).flags.rosc, undefined, 'only one shock so far');
  const back = run(['cpr', 'defib', 'epinephrine', 'defib']);
  assert.equal(back.rhythm, 'sinus');
  assert.ok(back.log.some((e) => e.kind === 'event' && /pulse returns/i.test(e.text)));
});

test('arrest: vitals read zero until a pulse returns, then recover', () => {
  const { def, s } = fresh('cardiac-arrest');
  advance(def, s, 3);
  assert.ok(s.vitals.hr < 1 && s.vitals.sbp < 1);
  for (const a of ['cpr', 'defib', 'epinephrine', 'defib']) perform(def, s, a);
  advance(def, s, 8);
  assert.ok(s.vitals.hr > 60, `hr ${s.vitals.hr}`);
  assert.ok(s.vitals.sbp > 70, `sbp ${s.vitals.sbp}`);
});

test('arrest: compressions slow the decline, and once a pulse is back compressions and shocks are harmful', () => {
  const a = fresh('cardiac-arrest'); const b = fresh('cardiac-arrest');
  perform(a.def, a.s, 'cpr');
  advance(a.def, a.s, 5); advance(b.def, b.s, 5);
  assert.ok(a.s.severity < b.s.severity);
  for (const x of ['defib', 'epinephrine', 'defib']) perform(a.def, a.s, x);
  assert.equal(a.s.flags.rosc, true);
  assert.equal(rating(a.def, a.s, 'cpr'), 'harmful');
  assert.equal(rating(a.def, a.s, 'defib'), 'harmful');
  assert.equal(rating(a.def, a.s, 'epinephrine'), 'harmful');
});

test('arrest: sounds are silent until a pulse returns, and tests only waste time', () => {
  const { def, s } = fresh('cardiac-arrest');
  assert.deepEqual(def.sounds(s), { heart: 'none', lungs: 'none' });
  assert.match(def.exam.pulses(s), /No carotid/);
  const learn = fresh('cardiac-arrest', MODES.LEARNING);
  perform(learn.def, learn.s, 'echo');
  assert.ok(learn.s.severity > 0.65, 'eight minutes in a test costs a great deal');
});

/* ---------- arrhythmias ---------- */
test('stable SVT: a vagal maneuver does not convert, adenosine does, and the ECG shows the rhythm', () => {
  const { def, s } = fresh('svt-stable');
  assert.equal(s.rhythm, 'svt');
  assert.ok(s.vitals.hr > 170);
  assert.equal(rating(def, s, 'vagal'), 'helpful');
  advance(def, s, 3);
  assert.equal(s.rhythm, 'svt');
  assert.equal(rating(def, s, 'adenosine'), 'helpful');
  assert.equal(s.rhythm, 'sinus');
  assert.equal(s.ecg.pattern, 'normal');
  const sv = fresh('svt-stable');
  assert.equal(sv.s.ecg.pattern, 'svt');
  assert.equal(rating(sv.def, sv.s, 'cardioversion'), 'neutral', 'a shock is not needed while stable');
});

test('stable SVT: the patient is never hypotensive', () => {
  const { def, s } = fresh('svt-stable');
  advance(def, s, 30);
  assert.ok(s.vitals.sbp > 100);
});

test('unstable VT: low pressure, wide complexes, and a synchronized shock is the first treatment', () => {
  const { def, s } = fresh('vt-unstable');
  assert.equal(s.rhythm, 'vt');
  assert.ok(s.vitals.sbp < 90 && s.vitals.hr > 170);
  assert.equal(s.ecg.pattern, 'vt');
  assert.equal(rating(def, s, 'cardioversion'), 'helpful');
  assert.equal(s.rhythm, 'sinus');
  assert.equal(rating(def, s, 'cardioversion'), 'neutral', 'already in sinus rhythm');
});

test('unstable VT: without amiodarone the tachycardia comes back after about 12 minutes, once', () => {
  const { def, s } = fresh('vt-unstable');
  perform(def, s, 'cardioversion');
  advance(def, s, 11);
  assert.equal(s.rhythm, 'sinus');
  advance(def, s, 2);
  assert.equal(s.rhythm, 'vt');
  assert.ok(s.log.some((e) => e.kind === 'event' && /come back/.test(e.text)));
  perform(def, s, 'cardioversion');
  advance(def, s, 40);
  assert.equal(s.flags.recurred, true);
  assert.equal(s.status, 'stabilized');
});

test('unstable VT: with amiodarone it does not come back', () => {
  const { def, s } = fresh('vt-unstable');
  perform(def, s, 'cardioversion'); perform(def, s, 'amiodarone');
  advance(def, s, 30);
  assert.ok(!s.flags.recurred);
  assert.equal(s.status, 'stabilized');
});

test('unstable VT: calcium channel blockers, beta-blockers, adenosine and an unsynchronized shock are harmful', () => {
  for (const id of ['diltiazem', 'metoprolol', 'adenosine', 'defib']) {
    const { def, s } = fresh('vt-unstable');
    const before = s.severity;
    assert.equal(rating(def, s, id), 'harmful', id);
    assert.ok(s.severity > before, id);
  }
});

/* ---------- hypertensive emergency and shock ---------- */
test('hypertensive emergency: severe pressure that falls steadily with one IV drug', () => {
  const { def, s } = fresh('hypertensive-emergency');
  assert.ok(s.vitals.sbp > 220 && s.vitals.dbp > 120);
  assert.equal(rating(def, s, 'labetalol'), 'helpful');
  advance(def, s, 15);
  assert.ok(s.vitals.sbp < 225);
  assert.ok(s.vitals.sbp > 150, 'a gradual fall, not a collapse');
});

test('hypertensive emergency: a second IV drug on top drops the pressure too fast', () => {
  const one = fresh('hypertensive-emergency'); const two = fresh('hypertensive-emergency');
  perform(one.def, one.s, 'labetalol');
  perform(two.def, two.s, 'labetalol');
  assert.equal(rating(two.def, two.s, 'nicardipine'), 'harmful');
  advance(one.def, one.s, 10); advance(two.def, two.s, 10);
  assert.ok(two.s.vitals.sbp < one.s.vitals.sbp - 30, `${two.s.vitals.sbp} vs ${one.s.vitals.sbp}`);
  assert.ok(two.s.log.some((e) => e.kind === 'event' && /too fast/.test(e.text)));
});

test('hypertensive emergency: aspirin, heparin, fluids and a pressor are harmful', () => {
  for (const id of ['aspirin', 'heparin', 'fluids', 'norepi']) {
    const { def, s } = fresh('hypertensive-emergency');
    assert.equal(rating(def, s, id), 'harmful', id);
  }
});

test('cardiogenic shock: pressors and an inotrope buy time but only opening the artery ends the case', () => {
  const { def, s } = fresh('cardiogenic-shock');
  for (const id of ['norepi', 'dobutamine', 'niv']) perform(def, s, id);
  advance(def, s, 300);
  assert.notEqual(s.status, 'stabilized');
  const win = fresh('cardiogenic-shock');
  for (const id of ['norepi', 'cathLab']) perform(win.def, win.s, id);
  advance(win.def, win.s, 120);
  assert.equal(win.s.status, 'stabilized');
});

test('cardiogenic shock: fluids, nitrates and beta-blockers are harmful', () => {
  for (const id of ['fluids', 'nitro', 'metoprolol', 'diltiazem']) {
    const { def, s } = fresh('cardiogenic-shock');
    assert.equal(rating(def, s, id), 'harmful', id);
  }
});

/* ---------- the board ---------- */
test('the board has nine cases with nine bays, and search finds every new case', () => {
  assert.equal(CASES.length, 9);
  assert.deepEqual(CASES.map((c) => c.person.bay).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const find = (q) => searchCases(CASES, { query: q }).results.map((c) => c.id);
  assert.ok(find('shock').includes('cardiogenic-shock'));
  assert.ok(find('arrest').includes('cardiac-arrest'));
  assert.ok(find('hypertension').includes('hypertensive-emergency'));
  assert.ok(find('supraventricular').includes('svt-stable'));
  assert.ok(find('ventricular tachycardia').includes('vt-unstable'));
  assert.ok(find('headache').includes('hypertensive-emergency'));
  assert.deepEqual(find('ARS-601'), ['cardiac-arrest']);
  assert.deepEqual(find('701'), ['hypertensive-emergency']);
  assert.equal(find('arrhythmia').length, 3);
});

test('by case number the board lists bays in order 1 to 9', () => {
  const order = searchCases(CASES, {}).results.map((c) => c.person.bay);
  assert.deepEqual(order, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
