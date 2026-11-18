import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, advance, perform, finish, menuFor, MODES } from '../src/engine/sim.js';
import { CATALOG } from '../src/engine/catalog.js';
import { debrief } from '../src/engine/score.js';
import { CASES, getCase } from '../src/cases/index.js';

// A sensible winning sequence for each case.
const WIN = {
  'stemi-anterior': ['ecg12', 'aspirin', 'cathLab', 'heparin', 'p2y12', 'nitro'],
  'afib-rvr': ['ecg12', 'pulses', 'bmp', 'echo', 'heparin', 'diltiazem'],
  'cardiac-tamponade': ['echo', 'pericardiocentesis'],
  adhf: ['ecg12', 'niv', 'furosemide', 'nitro'],
};

function playLearning(def, actions, { waitUntilEnd = true } = {}) {
  const s = createSim(def, MODES.LEARNING);
  for (const id of actions) {
    const r = perform(def, s, id);
    assert.ok(r.ok || s.status !== 'active', `${id} failed: ${r.error}`);
  }
  let guard = 0;
  while (waitUntilEnd && s.status === 'active' && guard++ < 200) perform(def, s, 'wait');
  return s;
}

function playChallenge(def, actions, minutes = 300) {
  const s = createSim(def, MODES.CHALLENGE);
  for (const id of actions) perform(def, s, id);
  advance(def, s, minutes);
  return s;
}

test('every action in a case refers to the shared catalog', () => {
  for (const def of CASES) {
    for (const id of Object.keys(def.treat)) assert.ok(CATALOG[id], `${def.id}.treat.${id}`);
    for (const id of Object.keys(def.exam)) assert.equal(CATALOG[id]?.kind, 'exam', `${def.id}.exam.${id}`);
    for (const id of Object.keys(def.tests)) assert.equal(CATALOG[id]?.kind, 'test', `${def.id}.tests.${id}`);
    for (const k of def.key) for (const id of k.ids) assert.ok(CATALOG[id], `${def.id}.key ${id}`);
  }
});

test('every case defines a result for every exam and test in the catalog', () => {
  for (const def of CASES) {
    for (const [id, a] of Object.entries(CATALOG)) {
      if (a.kind === 'exam') assert.equal(typeof def.exam[id], 'function', `${def.id} exam ${id}`);
      if (a.kind === 'test') assert.equal(typeof def.tests[id], 'function', `${def.id} test ${id}`);
    }
  }
});

test('key action weights add up to 100 in every case', () => {
  for (const def of CASES) assert.equal(def.key.reduce((n, k) => n + k.weight, 0), 100, def.id);
});

test('cases start active with plausible vitals', () => {
  for (const def of CASES) {
    const s = createSim(def, MODES.LEARNING);
    assert.equal(s.status, 'active');
    assert.ok(s.vitals.hr > 40 && s.vitals.hr < 200, def.id);
    assert.ok(s.vitals.sbp > 60 && s.vitals.sbp < 220, def.id);
  }
});

for (const def of CASES) {
  for (const mode of [MODES.LEARNING, MODES.CHALLENGE]) {
    test(`${def.name} (${mode}): winning path stabilizes the patient`, () => {
      const s = mode === MODES.LEARNING ? playLearning(def, WIN[def.id]) : playChallenge(def, WIN[def.id]);
      assert.equal(s.status, 'stabilized', s.endReason);
    });

    test(`${def.name} (${mode}): doing nothing ends in death`, () => {
      const s = mode === MODES.LEARNING ? playLearning(def, []) : playChallenge(def, []);
      assert.equal(s.status, 'dead');
      assert.ok(s.endReason.length > 10);
    });
  }
}

test('learning mode: actions advance the clock by their cost', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.LEARNING);
  perform(def, s, 'aspirin');
  assert.equal(s.t, CATALOG.aspirin.cost);
  perform(def, s, 'wait');
  assert.equal(s.t, CATALOG.aspirin.cost + CATALOG.wait.cost);
});

test('challenge mode: actions do not advance the clock; advance() does', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.CHALLENGE);
  perform(def, s, 'aspirin');
  assert.equal(s.t, 0);
  advance(def, s, 10);
  assert.equal(s.t, 10);
});

test('challenge mode has no wait action', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.CHALLENGE);
  assert.equal(perform(def, s, 'wait').ok, false);
  assert.ok(!menuFor(MODES.CHALLENGE).some((a) => a.id === 'wait'));
  assert.ok(menuFor(MODES.LEARNING).some((a) => a.id === 'wait'));
});

test('vitals change as time passes in challenge mode', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.CHALLENGE);
  const before = { ...s.vitals };
  advance(def, s, 20);
  assert.ok(s.vitals.sbp < before.sbp);
  assert.ok(s.vitals.hr > before.hr);
});

test('ECG parameters change with the patient state', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.LEARNING);
  assert.equal(s.ecg.alternans, true);
  assert.ok(s.ecg.amp < 1);
  perform(def, s, 'pericardiocentesis');
  assert.equal(s.ecg.alternans, false);
  assert.equal(s.ecg.amp, 1);
  const stemi = createSim(getCase('stemi-anterior'), MODES.LEARNING);
  assert.ok(stemi.ecg.stElev > 0.1);
});

test('AF rhythm changes to sinus after a successful cardioversion', () => {
  const def = getCase('afib-rvr');
  const s = createSim(def, MODES.LEARNING);
  assert.equal(s.rhythm, 'afib');
  perform(def, s, 'heparin');
  perform(def, s, 'cardioversion');
  assert.equal(s.rhythm, 'sinus');
});

test('exam and test text changes with the patient state', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.CHALLENGE);
  const before = perform(def, s, 'jvp').entry.text;
  perform(def, s, 'pericardiocentesis');
  const after = perform(def, s, 'jvp').entry.text;
  assert.notEqual(before, after);
  assert.match(after, /normal/i);
});

// Harmful actions: one per case, compared with a control run that waits instead.
const HARMFUL = {
  'stemi-anterior': 'fluids',
  'afib-rvr': 'cardioversion',
  'cardiac-tamponade': 'nitro',
  adhf: 'diltiazem',
};

for (const def of CASES) {
  test(`${def.name}: a harmful action visibly worsens the patient`, () => {
    const id = HARMFUL[def.id];
    const harmed = createSim(def, MODES.CHALLENGE);
    const control = createSim(def, MODES.CHALLENGE);
    const r = perform(def, harmed, id);
    assert.equal(r.entry.rating, 'harmful');
    advance(def, harmed, 6);
    advance(def, control, 6);
    assert.ok(harmed.severity > control.severity, 'severity is higher');
    const worse = harmed.vitals.sbp < control.vitals.sbp || harmed.vitals.spo2 < control.vitals.spo2
      || harmed.vitals.hr > control.vitals.hr || harmed.log.some((e) => e.kind === 'event');
    assert.ok(worse, 'vitals or events show the worsening');
  });

  test(`${def.name}: a harmful action can kill the patient`, () => {
    const id = HARMFUL[def.id];
    const s = createSim(def, MODES.LEARNING);
    perform(def, s, id);
    let guard = 0;
    while (s.status === 'active' && guard++ < 200) perform(def, s, 'wait');
    assert.equal(s.status, 'dead');
  });
}

test('AF: cardioversion without anticoagulation causes a stroke; with it, it is neutral', () => {
  const def = getCase('afib-rvr');
  const bad = createSim(def, MODES.LEARNING);
  assert.equal(perform(def, bad, 'cardioversion').entry.rating, 'harmful');
  assert.ok(bad.log.some((e) => e.kind === 'event' && /stroke/i.test(e.text)));
  const ok = createSim(def, MODES.LEARNING);
  perform(def, ok, 'heparin');
  assert.equal(perform(def, ok, 'cardioversion').entry.rating, 'neutral');
});

test('AF: cardioversion is helpful once the patient is unstable', () => {
  const def = getCase('afib-rvr');
  const s = createSim(def, MODES.CHALLENGE);
  advance(def, s, 85);
  assert.ok(s.vitals.sbp < 90, `sbp ${s.vitals.sbp}`);
  assert.equal(s.status, 'active');
  const r = perform(def, s, 'cardioversion');
  assert.equal(r.entry.rating, 'helpful');
});

test('AF: a second AV-nodal blocker is harmful', () => {
  const def = getCase('afib-rvr');
  const s = createSim(def, MODES.LEARNING);
  assert.equal(perform(def, s, 'diltiazem').entry.rating, 'helpful');
  assert.equal(perform(def, s, 'metoprolol').entry.rating, 'harmful');
});

test('nitroglycerin is harmful in STEMI only when blood pressure is low', () => {
  const def = getCase('stemi-anterior');
  assert.equal(perform(def, createSim(def, MODES.LEARNING), 'nitro').entry.rating, 'helpful');
  const low = createSim(def, MODES.CHALLENGE);
  advance(def, low, 80);
  assert.ok(low.vitals.sbp < 100);
  assert.equal(perform(def, low, 'nitro').entry.rating, 'harmful');
});

test('repeating a helpful treatment is allowed and rated neutral', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.LEARNING);
  assert.equal(perform(def, s, 'aspirin').entry.rating, 'helpful');
  const again = perform(def, s, 'aspirin');
  assert.ok(again.ok);
  assert.equal(again.entry.rating, 'neutral');
});

test('repeating a harmful treatment is harmful again', () => {
  const def = getCase('adhf');
  const s = createSim(def, MODES.CHALLENGE);
  perform(def, s, 'fluids');
  const second = perform(def, s, 'fluids');
  assert.equal(second.entry.rating, 'harmful');
});

test('tamponade: only the first two fluid boluses help', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.CHALLENGE);
  assert.equal(perform(def, s, 'fluids').entry.rating, 'helpful');
  assert.equal(perform(def, s, 'fluids').entry.rating, 'helpful');
  assert.equal(perform(def, s, 'fluids').entry.rating, 'neutral');
});

test('actions are refused after the case has ended', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.LEARNING);
  finish(def, s);
  assert.equal(s.status, 'finished');
  assert.equal(perform(def, s, 'aspirin').ok, false);
});

test('unknown actions are rejected', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.LEARNING);
  assert.equal(perform(def, s, 'nope').ok, false);
});

test('challenge: the patient can die before the learner acts', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.CHALLENGE);
  advance(def, s, 200);
  assert.equal(s.status, 'dead');
  const d = debrief(def, s);
  assert.equal(d.missed.length, def.key.length);
});

test('a test ordered just before death reports that the patient deteriorated', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.LEARNING);
  s.severity = 0.97;
  const r = perform(def, s, 'bmp');
  assert.equal(s.status, 'dead');
  assert.match(r.entry.text, /deteriorated/i);
});

test('a fresh run starts from the beginning (restart)', () => {
  const def = getCase('stemi-anterior');
  const a = createSim(def, MODES.LEARNING);
  perform(def, a, 'aspirin');
  advance(def, a, 20);
  const b = createSim(def, MODES.LEARNING);
  assert.equal(b.t, 0);
  assert.equal(b.log.length, 0);
  assert.equal(b.flags.aspirin, undefined);
});
