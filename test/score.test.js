import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, perform, finish, MODES } from '../src/engine/sim.js';
import { debrief, SCORING } from '../src/engine/score.js';
import { getCase, CASES } from '../src/cases/index.js';
import { beatValue, describeRhythm, EcgSampler } from '../src/ui/ecg.js';

function run(id, actions, { wait = true } = {}) {
  const def = getCase(id);
  const s = createSim(def, MODES.LEARNING);
  for (const a of actions) perform(def, s, a);
  let g = 0;
  while (wait && s.status === 'active' && g++ < 200) perform(def, s, 'wait');
  return { def, s, d: debrief(def, s) };
}

test('a strong STEMI run scores high and misses nothing', () => {
  const { d } = run('stemi-anterior', ['ecg12', 'aspirin', 'cathLab', 'heparin', 'p2y12', 'nitro']);
  assert.equal(d.status, 'stabilized');
  assert.equal(d.missed.length, 0);
  assert.ok(d.score >= 90, `score ${d.score}`);
});

test('doing nothing scores 0 and lists every key action as missed', () => {
  const { def, d } = run('stemi-anterior', []);
  assert.equal(d.status, 'dead');
  assert.equal(d.score, 0);
  assert.equal(d.missed.length, def.key.length);
});

test('harmful actions cost points and appear in the timeline as harmful', () => {
  const good = run('adhf', ['ecg12', 'niv', 'furosemide', 'nitro']).d;
  const harmed = run('adhf', ['fluids', 'ecg12', 'niv', 'furosemide', 'nitro']).d;
  assert.ok(harmed.timeline.some((e) => e.rating === 'harmful'));
  assert.ok(harmed.score < good.score, `${harmed.score} < ${good.score}`);
  assert.equal(harmed.breakdown.harmCount, 1);
  assert.equal(harmed.breakdown.harmPenalty, SCORING.harmPenaltyEach);
});

test('the harm penalty is capped', () => {
  const many = Array(10).fill('fluids');
  const { d } = run('stemi-anterior', many, { wait: false });
  assert.equal(d.breakdown.harmPenalty, SCORING.harmPenaltyMax);
  assert.ok(d.score >= 0);
});

test('a late key action earns half credit', () => {
  const early = run('stemi-anterior', ['cathLab'], { wait: false });
  const late = run('stemi-anterior', ['wait', 'wait', 'wait', 'wait', 'wait', 'cathLab'], { wait: false });
  const cath = (r) => r.d.keyResults.find((k) => k.ids.includes('cathLab'));
  assert.equal(cath(early).status, 'on-time');
  assert.equal(cath(late).status, 'late');
  assert.ok(cath(late).at > cath(late).deadline);
});

test('every timeline entry has a rating, a time and an explanation', () => {
  for (const def of CASES) {
    const s = createSim(def, MODES.LEARNING);
    perform(def, s, 'inspect'); perform(def, s, 'ecg12'); perform(def, s, 'oxygen'); perform(def, s, 'wait');
    const d = debrief(def, s);
    assert.ok(d.timeline.length >= 4);
    for (const e of d.timeline) {
      assert.ok(['helpful', 'harmful', 'neutral'].includes(e.rating), `${def.id} ${e.id}`);
      assert.equal(typeof e.t, 'number');
      assert.ok(e.why && e.why.length > 5, `${def.id} ${e.id} has no explanation`);
    }
  }
});

test('finishing early gives the outcome "finished" and no outcome points', () => {
  const def = getCase('stemi-anterior');
  const s = createSim(def, MODES.LEARNING);
  perform(def, s, 'aspirin');
  finish(def, s);
  const d = debrief(def, s);
  assert.equal(d.status, 'finished');
  assert.equal(d.breakdown.outcomeScore, 0);
  assert.match(d.outcome, /ended the case/i);
});

test('score is always an integer from 0 to 100', () => {
  for (const def of CASES) {
    const { d } = run(def.id, ['fluids', 'ecg12']);
    assert.ok(Number.isInteger(d.score) && d.score >= 0 && d.score <= 100);
  }
});

test('ECG: a beat has an R peak, and ST elevation raises the segment after the QRS', () => {
  const normal = (p) => beatValue(p, {});
  assert.ok(normal(0.245) > 0.9);
  assert.ok(normal(0.35) < 0.05);
  assert.ok(beatValue(0.35, { stElev: 0.25 }) > 0.2);
  assert.ok(beatValue(0.245, { amp: 0.5 }) < 0.55);
});

test('ECG: afib has no P wave and irregular intervals; sinus is regular', () => {
  assert.equal(beatValue(0.1, { pAmp: 0 }) < beatValue(0.1, { pAmp: 1 }), true);
  const seq = (rhythm) => {
    const s = new EcgSampler(() => 0.37 + (seq.n = ((seq.n ?? 0) + 1)) * 0.123 % 0.6);
    s.setParams({ rhythm, hr: 100, ecg: {} });
    for (let t = 0; t < 12; t += 0.01) s.sample(t);
    return s.beats.map((b) => +b.rr.toFixed(3));
  };
  const sinus = seq('sinus');
  assert.ok(sinus.every((rr) => rr === sinus[0]));
  const afib = seq('afib');
  assert.ok(new Set(afib).size > 3);
});

test('ECG: alternans alternates beat height; asystole is flat; VF is chaotic', () => {
  const s = new EcgSampler();
  s.setParams({ rhythm: 'sinus', hr: 60, ecg: { alternans: true } });
  for (let t = 0; t < 6; t += 0.01) s.sample(t);
  const alts = s.beats.map((b) => b.alt);
  assert.ok(alts.includes(1) && alts.includes(0.6));
  s.setParams({ rhythm: 'asystole', hr: 0, ecg: {} });
  assert.ok(Math.abs(s.sample(10)) < 0.02);
  s.setParams({ rhythm: 'vf', hr: 0, ecg: {} });
  const vals = Array.from({ length: 50 }, (_, i) => s.sample(11 + i * 0.03));
  assert.ok(Math.max(...vals) - Math.min(...vals) > 0.5);
});

test('ECG text equivalent describes the rhythm and key findings', () => {
  assert.match(describeRhythm('sinus', 90.4, { stElev: 0.25 }), /Sinus rhythm.*90.*ST elevation/);
  assert.match(describeRhythm('afib', 148, {}), /Atrial fibrillation.*148/);
  assert.match(describeRhythm('sinus', 130, { amp: 0.5, alternans: true }), /low voltage and electrical alternans/);
  assert.match(describeRhythm('asystole', 0), /no electrical activity/);
  assert.match(describeRhythm('vf', 0), /Ventricular fibrillation/);
});
