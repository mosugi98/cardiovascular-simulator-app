import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneModel, ZONES, IV_TREATMENTS } from '../src/ui/patientScene.js';
import { CASES, getCase } from '../src/cases/index.js';
import { CATALOG } from '../src/engine/catalog.js';
import { createSim, perform, advance, MODES } from '../src/engine/sim.js';

const fresh = (id) => { const def = getCase(id); return { def, s: createSim(def, MODES.CHALLENGE) }; };

test('every case describes its probandus', () => {
  for (const def of CASES) {
    assert.ok(def.person.age > 18 && ['man', 'woman'].includes(def.person.sex), def.id);
    assert.ok(['reclined', 'upright'].includes(def.person.pose), def.id);
    assert.match(def.person.skin, /^#[0-9a-f]{6}$/i);
    assert.ok(def.handover.length > 80 && /^Paramedic handover:/.test(def.handover), def.id);
    assert.ok(def.triage.level >= 1 && def.triage.level <= 5 && def.triage.label.length > 3, def.id);
    assert.equal(typeof def.look.jvp, 'function');
    assert.ok(def.speech(createSim(def, MODES.CHALLENGE)).length > 5, def.id);
  }
  assert.equal(new Set(CASES.map((c) => c.person.bay)).size, CASES.length, 'each case has its own bay');
});

test('each body zone runs a real exam action and has a label', () => {
  for (const z of ZONES) {
    assert.equal(CATALOG[z.action]?.kind, 'exam', z.id);
    assert.ok(z.label.length > 10);
  }
  assert.deepEqual(ZONES.map((z) => z.action).sort(), ['heartSounds', 'inspect', 'jvp', 'lungs', 'pulses']);
});

test('the patient looks worse as severity rises, and dead patients look dead', () => {
  const { def, s } = fresh('stemi-anterior');
  const early = sceneModel(def, s);
  advance(def, s, 60);
  const late = sceneModel(def, s);
  assert.ok(late.pallor > early.pallor);
  assert.ok(late.distress);
  assert.equal(late.dead, false);
  advance(def, s, 200);
  const dead = sceneModel(def, s);
  assert.equal(dead.dead, true);
  assert.equal(dead.breathSeconds, 0);
  assert.equal(dead.sweat, false);
});

test('sweating, neck veins and leg swelling follow the case', () => {
  const stemi = fresh('stemi-anterior');
  assert.equal(sceneModel(stemi.def, stemi.s).sweat, true);
  const af = fresh('afib-rvr');
  assert.equal(sceneModel(af.def, af.s).sweat, false);
  const tam = fresh('cardiac-tamponade');
  assert.equal(sceneModel(tam.def, tam.s).jvp, true);
  perform(tam.def, tam.s, 'pericardiocentesis');
  assert.equal(sceneModel(tam.def, tam.s).jvp, false, 'neck veins settle after drainage');
  assert.equal(sceneModel(tam.def, tam.s).drain, true);
  const hf = fresh('adhf');
  assert.equal(sceneModel(hf.def, hf.s).edema, true);
  assert.equal(sceneModel(hf.def, hf.s).jvp, true);
});

test('cyanosis appears at low oxygen saturation', () => {
  const { def, s } = fresh('adhf');
  assert.equal(sceneModel(def, s).cyanosis, true);
  perform(def, s, 'niv');
  advance(def, s, 10);
  assert.equal(sceneModel(def, s).cyanosis, false);
});

test('devices appear when the matching treatment is given', () => {
  const { def, s } = fresh('adhf');
  assert.equal(sceneModel(def, s).mask, null);
  assert.equal(sceneModel(def, s).iv, false);
  perform(def, s, 'oxygen');
  assert.equal(sceneModel(def, s).mask, 'o2');
  perform(def, s, 'niv');
  assert.equal(sceneModel(def, s).mask, 'niv');
  perform(def, s, 'furosemide');
  assert.equal(sceneModel(def, s).iv, true);
  const af = fresh('afib-rvr');
  assert.equal(sceneModel(af.def, af.s).pads, false);
  perform(af.def, af.s, 'heparin');
  perform(af.def, af.s, 'cardioversion');
  assert.equal(sceneModel(af.def, af.s).pads, true);
  for (const id of IV_TREATMENTS) assert.equal(CATALOG[id].kind, 'treat');
});

test('the ultrasound probe shows only while the learner has an echo running', () => {
  const { def, s } = fresh('cardiac-tamponade');
  assert.equal(sceneModel(def, s, { probeOn: true }).probe, false, 'no echo ordered yet');
  perform(def, s, 'echo');
  assert.equal(sceneModel(def, s, { probeOn: true }).probe, true);
  assert.equal(sceneModel(def, s, { probeOn: false }).probe, false);
});

test('breathing speed follows the breathing rate, within safe limits', () => {
  const { def, s } = fresh('adhf');
  const fast = sceneModel(def, s).breathSeconds;
  const stemi = fresh('stemi-anterior');
  const slower = sceneModel(stemi.def, stemi.s).breathSeconds;
  assert.ok(fast < slower);
  assert.ok(fast >= 1.2 && slower <= 8);
});

test('what the patient says changes with the case state', () => {
  const stemi = fresh('stemi-anterior');
  const first = stemi.def.speech(stemi.s);
  advance(stemi.def, stemi.s, 40);
  assert.notEqual(stemi.def.speech(stemi.s), first);
  const tam = fresh('cardiac-tamponade');
  perform(tam.def, tam.s, 'pericardiocentesis');
  assert.match(tam.def.speech(tam.s), /breathe again/);
  const af = fresh('afib-rvr');
  perform(af.def, af.s, 'cardioversion');
  assert.match(af.def.speech(af.s), /right arm|words/, 'stroke after cardioversion without anticoagulation');
});
