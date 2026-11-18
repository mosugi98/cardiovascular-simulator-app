import test from 'node:test';
import assert from 'node:assert/strict';
import { contraction, lvRadiusFactor, rvRadiusFactor, effusionGap, describeEcho } from '../src/ui/echo.js';
import { CASES, getCase } from '../src/cases/index.js';
import { createSim, perform, MODES } from '../src/engine/sim.js';

const echoOf = (id, mutate) => {
  const def = getCase(id);
  const s = createSim(def, MODES.CHALLENGE);
  mutate?.(def, s);
  return def.echo(s);
};

test('contraction is zero in diastole and peaks mid-systole', () => {
  assert.equal(contraction(0), 0);
  assert.ok(contraction(0.19) > 0.99);
  assert.equal(contraction(0.5), 0);
  assert.equal(contraction(0.9), 0);
});

test('the cavity area falls by the ejection fraction at peak systole', () => {
  const echo = { ef: 0.4, hypokinesis: null };
  const f = lvRadiusFactor(echo, 1, 0);
  assert.ok(Math.abs(f * f - 0.6) < 1e-9);
  assert.equal(lvRadiusFactor(echo, 0, 0), 1);
  const weak = lvRadiusFactor({ ef: 0.25, hypokinesis: null }, 1, 0);
  assert.ok(weak > f, 'a lower ejection fraction means less shrinking');
});

test('an anterior wall and apex that move poorly shrink less than the lateral wall', () => {
  const echo = { ef: 0.5, hypokinesis: 'anterior-apex' };
  const apex = lvRadiusFactor(echo, 1, -Math.PI / 2);
  const lateral = lvRadiusFactor(echo, 1, 0);
  assert.ok(apex > lateral + 0.15);
});

test('tamponade: the right ventricle free wall is pushed in during diastole, not in systole', () => {
  const echo = { rvCollapse: true };
  const diastole = rvRadiusFactor(echo, 0, Math.PI);
  const systole = rvRadiusFactor(echo, 1, Math.PI);
  assert.ok(diastole < 0.6);
  assert.ok(diastole < rvRadiusFactor({ rvCollapse: false }, 0, Math.PI));
  assert.ok(rvRadiusFactor(echo, 0, 0) > diastole, 'the septal side is pushed in less');
  assert.ok(systole > 0.7);
});

test('fluid gap grows with the effusion', () => {
  assert.ok(effusionGap({ effusion: 1 }) > effusionGap({ effusion: 0.15 }));
  assert.ok(effusionGap({ effusion: 0.15 }) > effusionGap({ effusion: 0 }));
});

test('every case defines an echo state with plausible values', () => {
  for (const def of CASES) {
    const e = echoOf(def.id);
    assert.ok(e.ef > 0.1 && e.ef < 0.9, def.id);
    assert.ok(e.lv > 0.5 && e.lv < 2 && e.la > 0.5 && e.la < 2 && e.wall > 0.3, def.id);
    assert.ok(e.effusion >= 0 && e.effusion <= 1, def.id);
    assert.ok(e.caption.length > 20, def.id);
  }
});

test('case echo findings match the case', () => {
  const stemi = echoOf('stemi-anterior');
  assert.equal(stemi.hypokinesis, 'anterior-apex');
  assert.ok(Math.abs(stemi.ef - 0.4) < 0.001);
  const adhf = echoOf('adhf');
  assert.ok(adhf.ef <= 0.25 + 1e-9 && adhf.lv > 1.2 && adhf.mr === true);
  const af = echoOf('afib-rvr');
  assert.ok(af.la > 1.2 && af.ef >= 0.5);
  const tam = echoOf('cardiac-tamponade');
  assert.equal(tam.effusion, 1);
  assert.equal(tam.rvCollapse, true);
});

test('draining the effusion changes the echo picture', () => {
  const def = getCase('cardiac-tamponade');
  const s = createSim(def, MODES.CHALLENGE);
  const before = def.echo(s);
  perform(def, s, 'pericardiocentesis');
  const after = def.echo(s);
  assert.ok(after.effusion < before.effusion);
  assert.equal(after.rvCollapse, false);
  assert.notEqual(after.caption, before.caption);
});

test('the text equivalent describes the main findings', () => {
  const text = describeEcho(echoOf('cardiac-tamponade'));
  assert.match(text, /Large fluid collection/);
  assert.match(text, /right ventricle collapses/);
  assert.match(describeEcho(echoOf('adhf')), /left ventricle is dilated.*mitral regurgitation|dilated/);
  assert.match(describeEcho(echoOf('stemi-anterior')), /anterior wall and apex move poorly/);
});
