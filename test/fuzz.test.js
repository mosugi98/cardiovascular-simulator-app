import test from 'node:test';
import assert from 'node:assert/strict';
import { createSim, perform, advance, finish, MODES } from '../src/engine/sim.js';
import { CATALOG } from '../src/engine/catalog.js';
import { debrief } from '../src/engine/score.js';
import { CASES } from '../src/cases/index.js';
import { ECG_PATTERNS } from '../src/ui/ecg12.js';
import { sceneModel, ZONES } from '../src/ui/patientScene.js';
import { activeAlarms, topLevel } from '../src/ui/alarms.js';
import { describeRhythm } from '../src/ui/ecg.js';
import { describeEcho } from '../src/ui/echo.js';
import { ask, INTENTS } from '../src/ui/history.js';

const RHYTHMS = new Set(['sinus', 'afib', 'svt', 'vt', 'vf', 'asystole']);
const HEART = new Set(['normal', 'muffled', 'afib', 's3', 'none']);
const LUNGS = new Set(['clear', 'crackles', 'none']);
const KINDS = new Set(['exam', 'test', 'treat', 'wait', 'history', 'event']);
const LIMITS = { hr: [0, 220], sbp: [0, 260], dbp: [0, 160], spo2: [0, 100], rr: [0, 60], temp: [30, 42] };
const BAD = /undefined|NaN|\[object|null/;

function rng(seed) {
  let x = seed;
  return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
}

function textOk(label, t, min = 4) {
  assert.equal(typeof t, 'string', `${label} is not text`);
  assert.ok(t.trim().length >= min, `${label} is empty`);
  assert.ok(!BAD.test(t), `${label} contains a bad value: ${t}`);
}

/** Everything that reads the state must work at every moment of every case. */
function checkState(def, s, where) {
  assert.ok(Number.isFinite(s.severity) && s.severity >= 0 && s.severity <= 1, `${where}: severity ${s.severity}`);
  assert.ok(Number.isFinite(s.t) && s.t >= 0, `${where}: time ${s.t}`);
  for (const [k, [lo, hi]] of Object.entries(LIMITS)) {
    assert.ok(Number.isFinite(s.vitals[k]) && s.vitals[k] >= lo - 1e-9 && s.vitals[k] <= hi + 1e-9, `${where}: ${k} = ${s.vitals[k]}`);
  }
  assert.ok(s.vitals.dbp <= s.vitals.sbp + 1e-6 || s.vitals.sbp < 5, `${where}: diastolic ${s.vitals.dbp} above systolic ${s.vitals.sbp}`);
  assert.ok(RHYTHMS.has(s.rhythm), `${where}: rhythm ${s.rhythm}`);
  assert.ok(ECG_PATTERNS[s.ecg.pattern ?? 'normal'], `${where}: ECG pattern ${s.ecg.pattern}`);
  assert.ok(['active', 'stabilized', 'dead', 'finished'].includes(s.status), `${where}: status ${s.status}`);
  for (const id of Object.keys(def.exam)) textOk(`${where}: exam ${id}`, def.exam[id](s));
  for (const id of Object.keys(def.tests)) textOk(`${where}: test ${id}`, def.tests[id](s));
  for (const kind of ['heart', 'lungs']) for (const [a, fn] of Object.entries(def.auscultation[kind])) textOk(`${where}: ${kind} ${a}`, fn(s));
  textOk(`${where}: speech`, def.speech(s));
  const e = def.echo(s);
  textOk(`${where}: echo caption`, e.caption);
  assert.ok(e.ef > 0 && e.ef < 1 && e.lv > 0 && e.la > 0 && e.wall > 0 && e.effusion >= 0 && e.effusion <= 1, `${where}: echo numbers`);
  textOk(`${where}: echo text`, describeEcho(e));
  for (const area of [undefined, 'aortic', 'pulmonic', 'tricuspid', 'mitral', 'upper', 'lower']) {
    const snd = def.sounds(s, area);
    assert.ok(HEART.has(snd.heart) && LUNGS.has(snd.lungs), `${where}: sounds at ${area}: ${JSON.stringify(snd)}`);
  }
  const m = sceneModel(def, s, { probeOn: true });
  assert.ok(Number.isFinite(m.pallor) && m.pallor >= 0 && m.pallor <= 1 && Number.isFinite(m.breathSeconds), `${where}: scene model`);
  for (const a of activeAlarms(s.vitals)) textOk(`${where}: alarm`, a.text);
  topLevel(activeAlarms(s.vitals));
  textOk(`${where}: rhythm text`, describeRhythm(s.rhythm, s.vitals.hr, s.ecg));
  for (const i of INTENTS) {
    const r = ask(def, s, i.ask);
    assert.ok(r && r.understood && r.intent === i.id, `${where}: question "${i.ask}" -> ${r?.intent}`);
    textOk(`${where}: answer to ${i.id}`, r.text);
  }
  for (const entry of s.log) {
    assert.ok(KINDS.has(entry.kind), `${where}: log kind ${entry.kind}`);
    assert.ok(Number.isFinite(entry.t), `${where}: log time`);
    if (entry.kind === 'event') textOk(`${where}: event`, entry.text);
    else {
      textOk(`${where}: log label`, entry.label, 3);
      assert.ok(['helpful', 'harmful', 'neutral'].includes(entry.rating), `${where}: rating ${entry.rating} for ${entry.id}`);
      textOk(`${where}: log why for ${entry.id}`, entry.why);
      if (entry.rating === 'helpful' || entry.rating === 'harmful') {
        if (entry.kind === 'treat') assert.ok(entry.source && entry.source.length > 10, `${where}: ${entry.id} (${entry.rating}) has no guideline`);
      }
    }
  }
  const d = debrief(def, s);
  assert.ok(Number.isInteger(d.score) && d.score >= 0 && d.score <= 100, `${where}: score ${d.score}`);
}

const ACTIONS = Object.keys(CATALOG);

for (const def of CASES) {
  for (const mode of [MODES.LEARNING, MODES.CHALLENGE]) {
    test(`fuzz: ${def.id} (${mode}): 120 random sessions keep every invariant`, () => {
      const rand = rng(1000 + def.caseNumber + (mode === MODES.LEARNING ? 1 : 2));
      for (let run = 0; run < 120; run++) {
        const s = createSim(def, mode);
        checkState(def, s, `${def.id} run ${run} start`);
        const steps = 1 + Math.floor(rand() * 14);
        let lastT = 0;
        for (let k = 0; k < steps; k++) {
          const where = `${def.id} ${mode} run ${run} step ${k}`;
          const roll = rand();
          const wasActive = s.status === 'active';
          const logBefore = s.log.length;
          if (roll < 0.15) {
            advance(def, s, Math.floor(rand() * 40));
          } else if (roll < 0.22) {
            finish(def, s);
          } else {
            const id = ACTIONS[Math.floor(rand() * ACTIONS.length)];
            const zone = rand() < 0.3 ? ZONES[Math.floor(rand() * ZONES.length)] : null;
            const opts = id === 'history' ? { label: 'A question', text: 'An answer' } : zone?.area && id === zone.action ? { area: zone.area } : {};
            const r = perform(def, s, id, opts);
            if (!wasActive) {
              assert.equal(r.ok, false, `${where}: ${id} was accepted after the case ended`);
              assert.equal(s.log.length, logBefore, `${where}: the log changed after the case ended`);
            } else if (id === 'wait' && mode === MODES.CHALLENGE) {
              assert.equal(r.ok, false, `${where}: wait accepted in challenge mode`);
            } else {
              assert.ok(r.ok, `${where}: ${id} refused: ${r.error}`);
              textOk(`${where}: result of ${id}`, r.entry.text ?? 'x ok');
            }
          }
          assert.ok(s.t >= lastT - 1e-9, `${where}: time went backwards`);
          lastT = s.t;
          if (!wasActive) assert.notEqual(s.status, 'active', `${where}: a finished case became active again`);
          checkState(def, s, where);
        }
        // An ended case cannot be changed.
        if (s.status !== 'active') {
          const snapshot = JSON.stringify({ t: s.t, sev: s.severity, v: s.vitals, status: s.status });
          advance(def, s, 30);
          perform(def, s, 'aspirin');
          assert.equal(JSON.stringify({ t: s.t, sev: s.severity, v: s.vitals, status: s.status }), snapshot, `${def.id} run ${run}: an ended case changed`);
        }
      }
    });
  }
}

test('fuzz: giving the same treatment many times never breaks a case', () => {
  for (const def of CASES) {
    for (const id of ACTIONS.filter((a) => CATALOG[a].kind === 'treat')) {
      const s = createSim(def, MODES.CHALLENGE);
      for (let i = 0; i < 6 && s.status === 'active'; i++) perform(def, s, id);
      advance(def, s, 20);
      checkState(def, s, `${def.id} repeated ${id}`);
    }
  }
});

test('fuzz: every case survives being left alone for a long time, and ends', () => {
  for (const def of CASES) {
    const s = createSim(def, MODES.CHALLENGE);
    advance(def, s, 2000);
    assert.notEqual(s.status, 'active', `${def.id} never ended`);
    checkState(def, s, `${def.id} after a long wait`);
  }
});

