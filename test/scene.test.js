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
    assert.ok(['reclined', 'upright', 'flat'].includes(def.person.pose), def.id);
    assert.match(def.person.skin, /^#[0-9a-f]{6}$/i);
    assert.ok(def.handover.length > 80 && /^Paramedic handover:/.test(def.handover), def.id);
    assert.ok(def.triage.level >= 1 && def.triage.level <= 5 && def.triage.label.length > 3, def.id);
    assert.equal(typeof def.look.jvp, 'function');
    assert.ok(def.speech(createSim(def, MODES.CHALLENGE)).length > 5, def.id);
  }
  assert.equal(new Set(CASES.map((c) => c.person.bay)).size, CASES.length, 'each case has its own bay');
});

test('there are 11 body sites, each runs a real exam action and has a label', () => {
  assert.equal(ZONES.length, 11);
  assert.equal(new Set(ZONES.map((z) => z.id)).size, 11);
  for (const z of ZONES) {
    assert.equal(CATALOG[z.action]?.kind, 'exam', z.id);
    assert.ok(z.label.length > 10, z.id);
    assert.ok(z.short.length > 3, z.id);
  }
  const count = (a) => ZONES.filter((z) => z.action === a).length;
  assert.deepEqual([count('inspect'), count('jvp'), count('heartSounds'), count('lungs'), count('pulses')], [1, 1, 4, 4, 1]);
});

test('the four heart areas and the upper and lower lung zones are all present', () => {
  assert.deepEqual(ZONES.filter((z) => z.action === 'heartSounds').map((z) => z.area).sort(), ['aortic', 'mitral', 'pulmonic', 'tricuspid']);
  assert.deepEqual(ZONES.filter((z) => z.action === 'lungs').map((z) => z.area).sort(), ['lower', 'lower', 'upper', 'upper']);
  for (const z of ZONES.filter((z) => z.area)) assert.ok(z.text && z.lx != null, `${z.id} has an on-screen label`);
});

test('body sites sit in the picture, do not overlap, and are placed like the real anatomy', () => {
  const by = Object.fromEntries(ZONES.map((z) => [z.id, z]));
  for (const z of ZONES) {
    assert.ok(z.x - z.r >= 0 && z.x + z.r <= 520 && z.y - z.r >= 0 && z.y + z.r <= 580, `${z.id} is inside the picture`);
  }
  for (let i = 0; i < ZONES.length; i++) {
    for (let j = i + 1; j < ZONES.length; j++) {
      const a = ZONES[i]; const b = ZONES[j];
      const gap = Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;
      assert.ok(gap > -2, `${a.id} and ${b.id} overlap`);
    }
  }
  // The patient's right is on the viewer's left. The aortic area is right of the breastbone, the others left of it.
  assert.ok(by.aortic.x < 260 && by.pulmonic.x > 260 && by.tricuspid.x > 260 && by.mitral.x > by.tricuspid.x);
  assert.ok(by.aortic.y < by.tricuspid.y && by.tricuspid.y < by.mitral.y, 'aortic and pulmonic are high, the apex is low');
  assert.ok(by.pulmonic.y === by.aortic.y);
  assert.ok(by['lung-ur'].x < 260 && by['lung-lr'].x < 260 && by['lung-ul'].x > 260 && by['lung-ll'].x > 260);
  assert.ok(by['lung-ur'].y < by['lung-lr'].y && by['lung-ul'].y < by['lung-ll'].y);
  assert.ok(by.face.y < by.neck.y && by.neck.y < by.aortic.y);
  assert.ok(by.wrist.y > by.mitral.y, 'the wrist is lower than the chest');
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

test('cardiac arrest: unresponsive, not breathing, then CPR shows and pads follow a shock', () => {
  const { def, s } = fresh('cardiac-arrest');
  let m = sceneModel(def, s);
  assert.equal(m.unresponsive, true);
  assert.equal(m.breathing, false);
  assert.equal(m.breathSeconds, 0);
  assert.equal(m.cpr, false);
  perform(def, s, 'cpr');
  assert.equal(sceneModel(def, s).cpr, true);
  perform(def, s, 'defib');
  assert.equal(sceneModel(def, s).pads, true);
  perform(def, s, 'epinephrine');
  assert.equal(sceneModel(def, s).iv, true);
  perform(def, s, 'defib');
  advance(def, s, 6);
  m = sceneModel(def, s);
  assert.equal(s.flags.rosc, true);
  assert.equal(m.cpr, false, 'the rescuer stops when a pulse returns');
  assert.equal(m.unresponsive, false);
  assert.equal(m.breathing, true);
});

test('a conscious patient is not shown as unresponsive and keeps breathing', () => {
  const { def, s } = fresh('stemi-anterior');
  const m = sceneModel(def, s);
  assert.equal(m.unresponsive, false);
  assert.equal(m.breathing, true);
  assert.equal(m.cpr, false);
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
