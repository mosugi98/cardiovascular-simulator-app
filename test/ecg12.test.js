import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEADS, LAYOUT, BASE_LEADS, ECG_PATTERNS, leadParams, leadBeat, buildBeats, leadValue,
} from '../src/ui/ecg12.js';
import { EcgSampler } from '../src/ui/ecg.js';
import { activeAlarms, topLevel, newCallouts, ALARM_LIMITS } from '../src/ui/alarms.js';
import { createSim, MODES } from '../src/engine/sim.js';
import { CASES } from '../src/cases/index.js';

/** Highest and lowest value of a lead across one beat (R wave region and ST region). */
function window12(lead, ecg, rhythm = 'sinus') {
  const beats = buildBeats({ rhythm, hr: 60, ecg }, 3, () => 0.5);
  const at = (t) => leadValue(t, beats, lead, { rhythm, ecg });
  // beat 1 starts at 0.7 s with rr 1 s; ST segment at phase 0.38 and R wave at phase 0.245
  const start = beats.find((b) => b.start >= 0.6).start;
  return { r: at(start + 0.245), st: at(start + 0.38) };
}

test('there are 12 leads, and the printed layout shows each exactly once', () => {
  assert.equal(LEADS.length, 12);
  assert.deepEqual(LAYOUT.flat().sort(), [...LEADS].sort());
  assert.deepEqual(Object.keys(BASE_LEADS).sort(), [...LEADS].sort());
});

test('normal ECG: lead II R is upright, aVR is inverted, V1 is mostly negative', () => {
  const II = window12('II', { pattern: 'normal' });
  const aVR = window12('aVR', { pattern: 'normal' });
  assert.ok(II.r > 0.8);
  assert.ok(aVR.r < 0.3);
  assert.ok(Math.abs(II.st) < 0.05);
  const p = leadParams('normal', 'V1');
  assert.ok(p.s < -0.8 && p.r < 0.4);
});

test('anterior STEMI: ST elevation in V1 to V4, reciprocal depression in II, III, aVF', () => {
  const ecg = { pattern: 'anterior-stemi' };
  for (const lead of ['V1', 'V2', 'V3', 'V4']) assert.ok(window12(lead, ecg).st > 0.15, `${lead} elevated`);
  for (const lead of ['II', 'III', 'aVF']) assert.ok(window12(lead, ecg).st < -0.05, `${lead} depressed`);
  assert.ok(window12('V6', ecg).st < 0.2);
  assert.ok(leadParams('anterior-stemi', 'V2').t > leadParams('normal', 'V2').t, 'hyperacute T wave in V2');
});

test('anterior STEMI after reperfusion: ST nearly back to baseline and T waves inverted in V2 and V3', () => {
  const ecg = { pattern: 'anterior-stemi-reperfused' };
  assert.ok(window12('V2', ecg).st < 0.15);
  assert.ok(leadParams('anterior-stemi-reperfused', 'V2').t < 0);
  assert.ok(leadParams('anterior-stemi-reperfused', 'V3').t < 0);
});

test('low voltage with alternans: complexes are half height and alternate beat to beat', () => {
  const full = window12('II', { pattern: 'low-voltage', amp: 1 }).r;
  const low = window12('II', { pattern: 'low-voltage', amp: 0.5 }).r;
  assert.ok(low < full * 0.6);
  const beats = buildBeats({ rhythm: 'sinus', hr: 100, ecg: { alternans: true } }, 5, () => 0.5);
  assert.ok(beats.some((b) => b.alt === 1) && beats.some((b) => b.alt === 0.6));
});

test('pericarditis: diffuse ST elevation, aVR depressed, PR segment depressed in II', () => {
  const ecg = { pattern: 'pericarditis' };
  assert.ok(window12('II', ecg).st > 0.08);
  assert.ok(window12('V5', ecg).st > 0.08);
  assert.ok(window12('aVR', ecg).st < -0.05);
  assert.ok(leadParams('pericarditis', 'II').pr < 0);
});

test('LBBB: wide QRS, QS in V1, broad R with ST depression in V6', () => {
  assert.ok(ECG_PATTERNS.lbbb.width > 2);
  assert.ok(leadParams('lbbb', 'V1').r < 0.1 && leadParams('lbbb', 'V1').s < -1.2);
  assert.ok(leadParams('lbbb', 'V6').st < 0 && leadParams('lbbb', 'V6').t < 0);
  // A wide complex stays above half its height for longer.
  const half = (width) => {
    let n = 0;
    for (let p = 0.15; p < 0.4; p += 0.001) if (leadBeat(p, leadParams('normal', 'II'), { width }) > 0.5) n++;
    return n;
  };
  assert.ok(half(2.2) > half(1) * 1.8);
});

test('atrial fibrillation: no P waves and irregular beat intervals across the printout', () => {
  const beats = buildBeats({ rhythm: 'afib', hr: 140, ecg: {} }, 10, (() => { let i = 0; return () => ((i += 0.137) % 1); })());
  assert.ok(beats.every((b) => b.pAmp === 0));
  assert.ok(new Set(beats.map((b) => b.rr.toFixed(3))).size > 5);
});

test('every ECG pattern a case can produce is defined', () => {
  const seen = new Set();
  for (const def of CASES) {
    const s = createSim(def, MODES.CHALLENGE);
    seen.add(s.ecg.pattern);
    s.flags.drained = true; s.flags.reperfused = true;
    seen.add(def.targets(s).ecg.pattern);
  }
  for (const name of seen) assert.ok(ECG_PATTERNS[name], `pattern ${name} is not defined`);
  assert.ok(seen.size >= 5);
});

test('pleth wave: one pulse per heartbeat, smaller when pulse pressure is low, flat in asystole', () => {
  const s = new EcgSampler(() => 0.5);
  s.setParams({ rhythm: 'sinus', hr: 60, ecg: {} });
  let max = 0;
  let maxLow = 0;
  for (let t = 0; t < 4; t += 0.01) { max = Math.max(max, s.pleth(t, 50)); maxLow = Math.max(maxLow, s.pleth(t, 10)); }
  assert.ok(max > 0.8);
  assert.ok(maxLow < max * 0.5);
  s.setParams({ rhythm: 'asystole', hr: 0, ecg: {} });
  assert.equal(s.pleth(5, 50), 0);
});

test('R-wave times are reported once per beat for the monitor beep', () => {
  const s = new EcgSampler(() => 0.5);
  s.setParams({ rhythm: 'sinus', hr: 60, ecg: {} });
  for (let t = 0; t < 5; t += 0.01) s.sample(t);
  const rs = s.rWaves(1, 4);
  assert.equal(rs.length, 3);
  s.setParams({ rhythm: 'vf', hr: 0, ecg: {} });
  assert.deepEqual(s.rWaves(0, 100), []);
});

test('alarms: normal vitals raise none; each limit raises the right alarm', () => {
  const ok = { hr: 80, sbp: 120, dbp: 80, spo2: 97, rr: 16 };
  assert.deepEqual(activeAlarms(ok), []);
  assert.equal(topLevel([]), null);
  const L = ALARM_LIMITS;
  const ids = (v) => activeAlarms({ ...ok, ...v }).map((a) => a.id);
  assert.deepEqual(ids({ hr: L.hrHigh + 1 }), ['hr-high']);
  assert.deepEqual(ids({ hr: L.hrLow - 1 }), ['hr-low']);
  assert.deepEqual(ids({ sbp: L.sbpLow - 1 }), ['bp-low']);
  assert.deepEqual(ids({ spo2: L.spo2Low - 1 }), ['spo2-low']);
  assert.deepEqual(ids({ rr: L.rrHigh + 1 }), ['rr-high']);
  assert.deepEqual(ids({ hr: L.hrHigh, sbp: L.sbpLow, spo2: L.spo2Low, rr: L.rrHigh }), [], 'limits themselves are not alarms');
});

test('alarms: urgent levels and nurse call-outs only for new alarms', () => {
  const v = { hr: 160, sbp: 70, dbp: 40, spo2: 80, rr: 30 };
  const alarms = activeAlarms(v);
  assert.equal(topLevel(alarms), 'high');
  assert.equal(activeAlarms({ ...v, hr: 130, sbp: 85, spo2: 88, rr: 16 }).every((a) => a.level === 'medium'), true);
  const lines = newCallouts(new Set(), alarms);
  assert.equal(lines.length, alarms.length);
  assert.match(lines.join(' '), /Nurse: Sats are down to 80%/);
  assert.deepEqual(newCallouts(new Set(alarms.map((a) => a.id)), alarms), []);
});
