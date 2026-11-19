import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, perform, advance, MODES } from '../src/engine/sim.js';
import { CATALOG } from '../src/engine/catalog.js';
import { CASES, getCase } from '../src/cases/index.js';

// A sensible winning sequence for each case.
const WIN = {
  'stemi-anterior': ['ecg12', 'aspirin', 'cathLab', 'heparin', 'p2y12', 'nitro'],
  'afib-rvr': ['ecg12', 'pulses', 'bmp', 'echo', 'heparin', 'diltiazem'],
  'cardiac-tamponade': ['echo', 'pericardiocentesis'],
  adhf: ['ecg12', 'niv', 'furosemide', 'nitro'],
  'svt-stable': ['ecg12', 'vagal', 'adenosine'],
  'vt-unstable': ['cardioversion', 'amiodarone', 'inspect', 'ecg12', 'bmp', 'oxygen'],
  'cardiogenic-shock': ['ecg12', 'echo', 'norepi', 'cathLab', 'dobutamine', 'oxygen'],
  'cardiac-arrest': ['cpr', 'defib', 'epinephrine', 'defib', 'amiodarone', 'oxygen'],
  'hypertensive-emergency': ['ecg12', 'labetalol', 'furosemide', 'nitro', 'inspect', 'bmp'],
};

const norm = (t) => String(t).replace(/\d+(\.\d+)?/g, '#');

/** Every result a learner can ask for: exams, tests, and each listening site. */
function results(def) {
  const out = {};
  for (const id of Object.keys(def.exam)) out[`exam.${id}`] = (s) => def.exam[id](s);
  for (const id of Object.keys(def.tests)) out[`test.${id}`] = (s) => def.tests[id](s);
  for (const kind of ['heart', 'lungs']) {
    for (const [area, fn] of Object.entries(def.auscultation?.[kind] ?? {})) out[`site.${kind}.${area}`] = (s) => fn(s);
  }
  return out;
}

function recovered(def) {
  const s = createSim(def, MODES.CHALLENGE);
  for (const a of WIN[def.id]) perform(def, s, a);
  advance(def, s, 300);
  return s;
}

const play = (id, actions, minutes = 0, mode = MODES.CHALLENGE) => {
  const def = getCase(id);
  const s = createSim(def, mode);
  for (const a of actions) perform(def, s, a);
  if (minutes) advance(def, s, minutes);
  return { def, s };
};

test('every case recovers on its winning path, so the comparison below is meaningful', () => {
  for (const def of CASES) assert.equal(recovered(def).status, 'stabilized', def.id);
});

for (const def of CASES) {
  test(`${def.name}: each result changes with treatment, or is listed as unchanged with a reason`, () => {
    const start = createSim(def, MODES.CHALLENGE);
    const end = recovered(def);
    const unchanged = def.unchanged ?? {};
    const problems = [];
    for (const [key, fn] of Object.entries(results(def))) {
      const same = norm(fn(start)) === norm(fn(end));
      if (same && !unchanged[key]) problems.push(`${key} is the same before and after treatment and has no reason`);
      if (!same && unchanged[key]) problems.push(`${key} changes with treatment, so it must not be listed as unchanged`);
    }
    for (const [key, reason] of Object.entries(unchanged)) {
      assert.ok(results(def)[key], `${def.id}: unknown result ${key}`);
      assert.ok(typeof reason === 'string' && reason.length >= 25, `${def.id}: ${key} needs a real reason`);
    }
    assert.deepEqual(problems, []);
  });
}

test('most results respond to treatment: at most a third are listed as unchanged', () => {
  let total = 0;
  let unchanged = 0;
  for (const def of CASES) {
    total += Object.keys(results(def)).length;
    unchanged += Object.keys(def.unchanged ?? {}).length;
  }
  assert.ok(unchanged / total <= 0.34, `${unchanged} of ${total} results are unchanged`);
});

/**
 * Responses to one treatment at a time. Each row gives the case, the treatment, how long to wait,
 * and the results that must read differently afterwards.
 */
const RESPONSES = [
  // Heart failure
  { id: 'adhf', give: ['furosemide'], wait: 25, changes: ['exam.lungs', 'exam.jvp', 'exam.pulses', 'test.cxr', 'test.bmp', 'site.lungs.lower', 'site.lungs.upper', 'test.bnp'] },
  { id: 'adhf', give: ['niv'], wait: 12, changes: ['exam.inspect', 'exam.lungs'] },
  { id: 'adhf', give: ['fluids'], wait: 6, changes: ['exam.lungs', 'exam.inspect'] },
  // STEMI
  { id: 'stemi-anterior', give: ['cathLab'], wait: 40, changes: ['exam.inspect', 'exam.heartSounds', 'exam.pulses', 'test.ecg12', 'test.troponin', 'test.bnp', 'test.bmp', 'test.echo', 'site.heart.mitral'] },
  { id: 'stemi-anterior', give: ['nitro'], wait: 3, changes: ['exam.inspect', 'exam.pulses'] },
  { id: 'stemi-anterior', give: ['fluids'], wait: 6, changes: ['exam.lungs', 'exam.jvp', 'test.cxr', 'test.bnp', 'site.lungs.lower'] },
  // Tamponade
  { id: 'cardiac-tamponade', give: ['pericardiocentesis'], wait: 2, changes: ['exam.inspect', 'exam.heartSounds', 'exam.lungs', 'exam.jvp', 'exam.pulses', 'test.ecg12', 'test.bmp', 'test.cxr', 'test.echo', 'site.heart.aortic', 'site.heart.mitral', 'site.lungs.lower'] },
  { id: 'cardiac-tamponade', give: ['fluids'], wait: 2, changes: ['exam.pulses'] },
  // Atrial fibrillation
  { id: 'afib-rvr', give: ['diltiazem'], wait: 20, changes: ['exam.inspect', 'exam.heartSounds', 'exam.pulses', 'test.ecg12', 'site.heart.aortic', 'site.heart.mitral'] },
  { id: 'afib-rvr', give: ['heparin', 'cardioversion'], wait: 5, changes: ['exam.heartSounds', 'exam.pulses', 'test.ecg12', 'exam.inspect'] },
  // SVT
  { id: 'svt-stable', give: ['adenosine'], wait: 5, changes: ['exam.inspect', 'exam.heartSounds', 'exam.jvp', 'exam.pulses', 'test.ecg12', 'site.heart.mitral'] },
  { id: 'svt-stable', give: ['vagal'], wait: 0, changes: ['exam.pulses'] },
  // VT
  { id: 'vt-unstable', give: ['cardioversion'], wait: 3, changes: ['exam.inspect', 'exam.heartSounds', 'exam.jvp', 'exam.pulses', 'test.ecg12', 'site.heart.mitral'] },
  { id: 'vt-unstable', give: ['cardioversion', 'amiodarone'], wait: 3, changes: ['exam.inspect'] },
  // Shock
  { id: 'cardiogenic-shock', give: ['norepi'], wait: 10, changes: ['exam.inspect', 'exam.pulses'] },
  { id: 'cardiogenic-shock', give: ['norepi', 'cathLab'], wait: 45, changes: ['exam.inspect', 'exam.heartSounds', 'exam.lungs', 'exam.jvp', 'test.ecg12', 'test.bnp', 'test.bmp', 'test.cxr', 'test.echo', 'site.heart.mitral', 'site.lungs.upper'] },
  { id: 'cardiogenic-shock', give: ['fluids'], wait: 5, changes: ['exam.lungs', 'exam.inspect'] },
  // Arrest
  { id: 'cardiac-arrest', give: ['cpr'], wait: 1, changes: ['exam.inspect', 'exam.pulses', 'exam.heartSounds', 'test.ecg12', 'test.cxr'] },
  { id: 'cardiac-arrest', give: ['cpr', 'oxygen'], wait: 1, changes: ['exam.lungs'] },
  { id: 'cardiac-arrest', give: ['cpr', 'defib', 'epinephrine', 'defib'], wait: 6, changes: ['exam.inspect', 'exam.heartSounds', 'exam.lungs', 'exam.pulses', 'exam.jvp', 'test.ecg12', 'test.bmp', 'test.echo', 'site.heart.aortic', 'site.lungs.upper'] },
  // Hypertensive emergency
  { id: 'hypertensive-emergency', give: ['labetalol'], wait: 25, changes: ['exam.inspect', 'exam.heartSounds', 'exam.pulses', 'site.heart.aortic'] },
  { id: 'hypertensive-emergency', give: ['furosemide'], wait: 25, changes: ['exam.lungs', 'test.cxr', 'site.lungs.lower'] },
  { id: 'hypertensive-emergency', give: ['labetalol', 'nicardipine'], wait: 8, changes: ['exam.inspect', 'exam.pulses', 'test.bmp'] },
];

for (const row of RESPONSES) {
  test(`${row.id}: after ${row.give.join(' + ')} (${row.wait} min) these read differently: ${row.changes.join(', ')}`, () => {
    const before = createSim(getCase(row.id), MODES.CHALLENGE);
    const { def, s } = play(row.id, row.give, row.wait);
    assert.ok(s.status === 'active' || s.status === 'stabilized', `${row.id} ended as ${s.status}`);
    const fns = results(def);
    const same = row.changes.filter((key) => {
      assert.ok(fns[key], `unknown result ${key}`);
      return norm(fns[key](before)) === norm(fns[key](s));
    });
    assert.deepEqual(same, [], `still the same after treatment: ${same.join(', ')}`);
  });
}

test('a harmful treatment changes the findings too, not only the vital signs', () => {
  const cases = [
    ['adhf', ['diltiazem'], 'exam.inspect'], ['cardiac-tamponade', ['nitro'], 'exam.pulses'], ['stemi-anterior', ['fluids'], 'exam.lungs'],
    ['hypertensive-emergency', ['labetalol', 'nicardipine'], 'exam.inspect'], ['cardiogenic-shock', ['fluids'], 'exam.lungs'],
  ];
  for (const [id, give, key] of cases) {
    const base = createSim(getCase(id), MODES.CHALLENGE);
    const { def, s } = play(id, give, 8);
    const fn = results(def)[key];
    assert.notEqual(norm(fn(base)), norm(fn(s)), `${id} ${key}`);
  }
});

test('a patient left untreated gets worse in the findings as well', () => {
  // Each patient is left until late in their decline, but still alive.
  for (const [id, minutes] of [['adhf', 40], ['cardiac-tamponade', 40], ['cardiogenic-shock', 25], ['stemi-anterior', 58]]) {
    const base = createSim(getCase(id), MODES.CHALLENGE);
    const { def, s } = play(id, [], minutes);
    assert.ok(s.status === 'active', `${id} should still be alive at ${minutes} min`);
    const fns = results(def);
    const changed = Object.keys(fns).filter((k) => norm(fns[k](base)) !== norm(fns[k](s)));
    assert.ok(changed.length >= 3, `${id}: only ${changed.length} findings changed as the patient worsened`);
  }
});

test('tests that follow a trend change over time', () => {
  const stemi = getCase('stemi-anterior');
  const early = createSim(stemi, MODES.CHALLENGE);
  const later = createSim(stemi, MODES.CHALLENGE);
  advance(stemi, later, 30);
  assert.notEqual(stemi.tests.troponin(early), stemi.tests.troponin(later));
  assert.match(stemi.tests.troponin(later), /rising/);
});

test('every catalog exam and test still returns text in every case at the start and after recovery', () => {
  for (const def of CASES) {
    const s0 = createSim(def, MODES.CHALLENGE);
    const s1 = recovered(def);
    for (const [id, a] of Object.entries(CATALOG)) {
      const fn = a.kind === 'exam' ? def.exam[id] : a.kind === 'test' ? def.tests[id] : null;
      if (!fn) continue;
      for (const st of [s0, s1]) {
        const t = fn(st);
        assert.equal(typeof t, 'string', `${def.id} ${id}`);
        assert.ok(t.length > 8 && !/undefined|NaN|\[object/.test(t), `${def.id} ${id}: ${t}`);
      }
    }
  }
});

