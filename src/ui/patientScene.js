// The probandus: a patient in a resus-bay bed, drawn from the front.
// Body sites are real buttons. Devices (oxygen mask, IV, pads, probe) appear as the learner treats.

const NS = 'http://www.w3.org/2000/svg';

/** Treatments given through an IV line. */
export const IV_TREATMENTS = ['heparin', 'metoprolol', 'diltiazem', 'furosemide', 'fluids', 'norepi', 'epinephrine', 'amiodarone', 'adenosine', 'labetalol', 'nicardipine', 'dobutamine'];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const VIEW = Object.freeze({ full: '0 0 520 580', chest: '100 170 320 357' });

/**
 * Body sites. x and y are in the picture. The patient's right is on the viewer's left.
 * `area` is passed to the examination so the finding can depend on where the learner listens.
 */
export const ZONES = Object.freeze([
  { id: 'face', action: 'inspect', tool: 'look', label: 'Look at the patient: face and general appearance', short: 'face', x: 260, y: 100, r: 46 },
  { id: 'neck', action: 'jvp', tool: 'hands', label: 'Check the neck veins (JVP)', short: 'neck veins', x: 238, y: 160, r: 15 },
  { id: 'aortic', action: 'heartSounds', tool: 'stethoscope', area: 'aortic', label: 'Listen to the heart: aortic area, second space right of the breastbone', short: 'aortic area', text: 'Aortic', x: 237, y: 238, r: 17, lx: 213, ly: 242, anchor: 'end' },
  { id: 'pulmonic', action: 'heartSounds', tool: 'stethoscope', area: 'pulmonic', label: 'Listen to the heart: pulmonic area, second space left of the breastbone', short: 'pulmonic area', text: 'Pulmonic', x: 283, y: 238, r: 17, lx: 307, ly: 242, anchor: 'start' },
  { id: 'tricuspid', action: 'heartSounds', tool: 'stethoscope', area: 'tricuspid', label: 'Listen to the heart: tricuspid area, lower left edge of the breastbone', short: 'tricuspid area', text: 'Tricuspid', x: 283, y: 292, r: 17, lx: 307, ly: 296, anchor: 'start' },
  { id: 'mitral', action: 'heartSounds', tool: 'stethoscope', area: 'mitral', label: 'Listen to the heart: mitral area, the apex, fifth space on the left', short: 'mitral area (apex)', text: 'Mitral', x: 340, y: 340, r: 17, lx: 364, ly: 344, anchor: 'start' },
  { id: 'lung-ur', action: 'lungs', tool: 'stethoscope', area: 'upper', label: 'Listen to the lungs: right upper zone', short: 'right upper zone', text: 'R upper', x: 186, y: 226, r: 19, lx: 186, ly: 202, anchor: 'middle' },
  { id: 'lung-ul', action: 'lungs', tool: 'stethoscope', area: 'upper', label: 'Listen to the lungs: left upper zone', short: 'left upper zone', text: 'L upper', x: 338, y: 214, r: 19, lx: 338, ly: 190, anchor: 'middle' },
  { id: 'lung-lr', action: 'lungs', tool: 'stethoscope', area: 'lower', label: 'Listen to the lungs: right lower zone', short: 'right lower zone', text: 'R lower', x: 168, y: 318, r: 19, lx: 168, ly: 352, anchor: 'middle' },
  { id: 'lung-ll', action: 'lungs', tool: 'stethoscope', area: 'lower', label: 'Listen to the lungs: left lower zone', short: 'left lower zone', text: 'L lower', x: 358, y: 284, r: 19, lx: 358, ly: 260, anchor: 'middle' },
  { id: 'wrist', action: 'pulses', tool: 'hands', label: 'Feel the wrist pulse and check perfusion', short: 'wrist', x: 100, y: 416, r: 18 },
]);

/** What the scene should show for this moment of a case. Pure, so it can be tested. */
export function sceneModel(def, s, { probeOn = false } = {}) {
  const v = s.vitals;
  const sev = s.severity;
  const given = new Set(s.log.filter((e) => e.kind === 'treat').map((e) => e.id));
  const done = new Set(s.log.filter((e) => e.kind !== 'event').map((e) => e.id));
  const dead = s.status === 'dead';
  const stable = s.status === 'stabilized';
  const unresponsive = dead || !!def.look.unresponsive?.(s);
  return {
    dead,
    unresponsive,
    pallor: dead ? 1 : clamp((sev - 0.2) / 0.7, 0, 1),
    sweat: !dead && !stable && !!def.look.sweaty && sev > 0.3,
    cyanosis: !dead && v.spo2 < 88,
    jvp: !!def.look.jvp(s),
    edema: !!def.look.edema,
    dyspnea: !dead && !unresponsive && !!def.look.dyspnea(s),
    distress: !dead && !unresponsive && !stable && sev > 0.5,
    mask: given.has('niv') ? 'niv' : given.has('oxygen') ? 'o2' : null,
    iv: IV_TREATMENTS.some((id) => given.has(id)),
    pads: given.has('cardioversion') || given.has('defib'),
    cpr: given.has('cpr') && !s.flags.rosc && !dead,
    drain: !!s.flags.drained,
    probe: probeOn && done.has('echo') && !dead,
    breathing: !dead && v.rr >= 2,
    breathSeconds: dead || v.rr < 2 ? 0 : clamp(60 / Math.max(6, v.rr), 1.2, 8),
  };
}

function mix(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16));
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * t)).join(',')})`;
}

function el(tag, attrs = {}, ...kids) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  for (const kid of kids.flat()) if (kid) e.append(kid);
  return e;
}

/**
 * Build the scene. `onZone(zone)` is called when a body site is pressed.
 * Returns { el, svg, update(state, extras), setTool(toolId), flashZone(zone), zones }.
 */
export function createScene(def, onZone) {
  const person = def.person;
  const female = person.sex === 'woman';

  const svg = el('svg', { viewBox: VIEW.full, class: 'scene-svg', preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': `Probandus: ${person.age}-year-old ${person.sex} in a bed, seen from the front. Body sites are buttons.` });
  svg.style.setProperty('--skin', person.skin);
  svg.style.setProperty('--hair', person.hair);

  // Bed, pillow, and the sheet over the legs.
  svg.append(
    el('rect', { x: 52, y: 12, width: 416, height: 556, rx: 18, fill: '#c9d6da' }),
    el('rect', { x: 66, y: 24, width: 388, height: 532, rx: 12, fill: '#e9f0f2' }),
    el('rect', { x: 36, y: 120, width: 14, height: 360, rx: 6, fill: '#8795a0' }),
    el('rect', { x: 470, y: 120, width: 14, height: 360, rx: 6, fill: '#8795a0' }),
    el('rect', { x: 176, y: 30, width: 168, height: 84, rx: 28, fill: '#f6f9fa', stroke: '#c2d0d5', 'stroke-width': 2 }),
  );

  // Legs and feet below the sheet. Ankles swell in heart failure.
  const legs = el('g', { class: 'legs' },
    el('rect', { class: 'ankle', x: 196, y: 494, width: 50, height: 58, rx: 22, fill: 'var(--skin)' }),
    el('rect', { class: 'ankle', x: 274, y: 494, width: 50, height: 58, rx: 22, fill: 'var(--skin)' }),
    el('ellipse', { cx: 221, cy: 556, rx: 30, ry: 12, fill: 'var(--skin)' }),
    el('ellipse', { cx: 299, cy: 556, rx: 30, ry: 12, fill: 'var(--skin)' }),
    el('g', { class: 'edema-marks', 'aria-hidden': 'true' },
      [[212, 520], [232, 536], [290, 520], [308, 536]].map(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 6, ry: 3.5, fill: 'rgba(90,50,40,.3)' }))),
  );
  const sheet = el('path', { d: 'M 90 410 L 430 410 L 440 504 L 332 508 L 318 498 L 202 498 L 188 508 L 80 504 Z', fill: '#f5f8f9', stroke: '#cfdadd', 'stroke-width': 2 });
  svg.append(legs, sheet,
    el('path', { d: 'M 100 436 L 420 436', stroke: '#dfe8ea', 'stroke-width': 3, fill: 'none' }));

  // IV pole with a bag and line (shown when used).
  const iv = el('g', { class: 'dev dev-iv', 'aria-hidden': 'true' },
    el('rect', { x: 14, y: 40, width: 6, height: 520, fill: '#8795a0' }),
    el('path', { d: 'M 4 46 L 40 46', stroke: '#8795a0', 'stroke-width': 6, 'stroke-linecap': 'round' }),
    el('rect', { x: 2, y: 54, width: 34, height: 64, rx: 9, fill: 'rgba(210,235,245,.9)', stroke: '#6fa0b5', 'stroke-width': 2 }),
    el('rect', { x: 6, y: 86, width: 26, height: 28, rx: 6, fill: 'rgba(150,200,225,.85)' }),
    el('path', { d: 'M 19 122 C 19 250 60 340 98 392', fill: 'none', stroke: 'rgba(120,170,190,.95)', 'stroke-width': 2.5 }));
  svg.append(iv);

  // Everything on the body that moves with breathing.
  const breathe = el('g', { class: 'breathe' });

  // Arms.
  const rightArm = el('g', { class: 'arm' },
    el('path', { d: 'M 150 210 L 114 322', stroke: 'var(--skin)', 'stroke-width': 38, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: 'M 114 322 L 100 414', stroke: 'var(--skin)', 'stroke-width': 30, 'stroke-linecap': 'round', fill: 'none' }),
    el('ellipse', { cx: 97, cy: 440, rx: 16, ry: 21, fill: 'var(--skin)' }),
    el('path', { d: 'M 150 210 L 128 276', stroke: '#9cc8d2', 'stroke-width': 45, 'stroke-linecap': 'round', fill: 'none' }),
    el('rect', { x: 88, y: 392, width: 24, height: 7, rx: 2, fill: '#fff' }),
  );
  const leftArm = el('g', { class: 'arm' },
    el('path', { d: 'M 370 210 L 406 322', stroke: 'var(--skin)', 'stroke-width': 38, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: 'M 406 322 L 420 414', stroke: 'var(--skin)', 'stroke-width': 30, 'stroke-linecap': 'round', fill: 'none' }),
    el('ellipse', { cx: 423, cy: 440, rx: 16, ry: 21, fill: 'var(--skin)' }),
    el('path', { d: 'M 370 210 L 392 276', stroke: '#9cc8d2', 'stroke-width': 45, 'stroke-linecap': 'round', fill: 'none' }),
  );
  const cuff = el('g', { class: 'cuff', 'aria-hidden': 'true' },
    el('path', { d: 'M 395 290 L 402 320', stroke: '#2b5379', 'stroke-width': 40, 'stroke-linecap': 'butt', fill: 'none' }));
  const clip = el('g', { class: 'spo2-clip', 'aria-hidden': 'true' },
    el('rect', { x: 424, y: 448, width: 16, height: 26, rx: 5, fill: '#2d3438' }),
    el('circle', { cx: 432, cy: 456, r: 2.6, fill: '#ff4d4d' }));

  // Torso in a hospital gown, neck and head.
  const neck = el('rect', { x: 236, y: 132, width: 48, height: 56, rx: 20, fill: 'var(--skin)' });
  const jvp = el('g', { class: 'jvp', 'aria-hidden': 'true' },
    el('path', { d: 'M 247 182 C 242 168 243 152 249 138', fill: 'none', stroke: '#5b82b3', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.92 }),
    el('ellipse', { cx: 246, cy: 158, rx: 6, ry: 15, fill: '#6f95c4', opacity: 0.8 }));
  const strain = el('g', { class: 'strain', 'aria-hidden': 'true', stroke: 'rgba(60,30,20,.5)', 'stroke-width': 2.2, fill: 'none' },
    el('path', { d: 'M 228 186 L 236 150' }), el('path', { d: 'M 292 186 L 284 150' }));
  const gown = el('path', { d: 'M 150 206 Q 196 172 236 180 L 284 180 Q 324 172 370 206 L 386 292 Q 388 352 368 410 L 152 410 Q 132 352 134 292 Z', fill: '#9cc8d2', stroke: '#7fb0bc', 'stroke-width': 2.5 });
  const collar = el('path', { d: 'M 236 180 L 260 222 L 284 180', fill: 'var(--skin)', stroke: '#7fb0bc', 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  const seam = el('path', { d: 'M 260 222 L 260 408', fill: 'none', stroke: '#86b4c0', 'stroke-width': 2, 'stroke-dasharray': '5 6' });
  const sternum = el('path', { d: 'M 260 200 L 260 330', stroke: 'rgba(40,70,80,.18)', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' });
  const electrodes = el('g', { class: 'electrodes', 'aria-hidden': 'true' },
    [[150, 238], [370, 238], [158, 392], [362, 392]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 7, fill: '#f1f1f1', stroke: '#9a9a9a', 'stroke-width': 1.5 })));

  // Devices that appear with treatment, on the chest.
  const pads = el('g', { class: 'dev dev-pads', 'aria-hidden': 'true' },
    el('rect', { x: 168, y: 192, width: 44, height: 62, rx: 8, transform: 'rotate(-14 190 223)', fill: '#fafafa', stroke: '#e58b2a', 'stroke-width': 3 }),
    el('rect', { x: 318, y: 318, width: 44, height: 62, rx: 8, transform: 'rotate(14 340 349)', fill: '#fafafa', stroke: '#e58b2a', 'stroke-width': 3 }));
  const probe = el('g', { class: 'dev dev-probe', 'aria-hidden': 'true' },
    el('rect', { x: 284, y: 290, width: 38, height: 22, rx: 7, fill: '#26343a', stroke: '#111', 'stroke-width': 1.5 }));
  const sweatChest = el('g', { class: 'drops', 'aria-hidden': 'true' },
    [[206, 262], [316, 262], [250, 372]].map(([x, y], i) => el('path', { class: `drop drop-${i}`, d: `M ${x} ${y} q 4 7 0 11 q -4 -4 0 -11 z`, fill: 'rgba(210,235,245,.95)' })));

  breathe.append(neck, jvp, strain, rightArm, leftArm, gown, collar, seam, sternum, electrodes, pads, probe, sweatChest, cuff, clip);

  // Head, facing the viewer.
  const hairBack = female
    ? el('path', { d: 'M 214 70 C 176 90 178 170 196 196 L 226 178 C 216 150 218 110 226 84 Z M 306 70 C 344 90 342 170 324 196 L 294 178 C 304 150 302 110 294 84 Z', fill: 'var(--hair)' })
    : null;
  const head = el('g', { class: 'head' },
    el('ellipse', { cx: 260, cy: 100, rx: 44, ry: 54, fill: 'var(--skin)' }),
    el('ellipse', { cx: 214, cy: 106, rx: 8, ry: 14, fill: 'var(--skin)', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1.5 }),
    el('ellipse', { cx: 306, cy: 106, rx: 8, ry: 14, fill: 'var(--skin)', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1.5 }),
    el('path', { d: 'M 216 88 C 212 36 308 36 304 88 C 292 66 228 66 216 88 Z', fill: 'var(--hair)' }),
    el('g', { class: 'eyes' },
      el('circle', { class: 'eye eye-open', cx: 243, cy: 98, r: 3.6, fill: '#241a17' }),
      el('circle', { class: 'eye eye-open', cx: 277, cy: 98, r: 3.6, fill: '#241a17' }),
      el('path', { class: 'eye eye-shut', d: 'M 237 98 Q 243 102 249 98', fill: 'none', stroke: '#241a17', 'stroke-width': 2.2 }),
      el('path', { class: 'eye eye-shut', d: 'M 271 98 Q 277 102 283 98', fill: 'none', stroke: '#241a17', 'stroke-width': 2.2 })),
    el('g', { class: 'brows' },
      el('path', { class: 'brow brow-l', d: 'M 235 86 L 251 86', stroke: '#2a201c', 'stroke-width': 3, 'stroke-linecap': 'round' }),
      el('path', { class: 'brow brow-r', d: 'M 269 86 L 285 86', stroke: '#2a201c', 'stroke-width': 3, 'stroke-linecap': 'round' })),
    el('path', { d: 'M 260 100 L 255 119 L 265 119', fill: 'none', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 2, 'stroke-linejoin': 'round' }),
    el('path', { class: 'mouth mouth-closed', d: 'M 245 133 Q 260 138 275 133', fill: 'none', stroke: 'var(--lip)', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    el('ellipse', { class: 'mouth mouth-open', cx: 260, cy: 134, rx: 11, ry: 7, fill: '#5a2b2b', stroke: 'var(--lip)', 'stroke-width': 3 }),
    el('g', { class: 'drops', 'aria-hidden': 'true' },
      [[238, 66], [262, 62], [284, 68]].map(([x, y], i) => el('path', { class: `drop drop-${i}`, d: `M ${x} ${y} q 4 7 0 11 q -4 -4 0 -11 z`, fill: 'rgba(210,235,245,.95)' }))));

  const mask = el('g', { class: 'dev dev-mask', 'aria-hidden': 'true' },
    el('path', { class: 'mask-o2', d: 'M 236 110 Q 260 100 284 110 L 292 140 Q 260 160 228 140 Z', fill: 'rgba(120,205,160,.62)', stroke: '#3a9972', 'stroke-width': 3 }),
    el('path', { class: 'mask-niv', d: 'M 230 78 Q 260 64 290 78 L 300 138 Q 260 168 220 138 Z', fill: 'rgba(225,240,245,.58)', stroke: '#5b93a6', 'stroke-width': 4 }),
    el('path', { d: 'M 236 112 C 190 110 184 90 214 84 M 284 112 C 330 110 336 90 306 84', stroke: '#e8f1f4', 'stroke-width': 2.6, fill: 'none' }),
    el('path', { d: 'M 260 158 C 262 190 330 200 420 180 L 510 150', stroke: '#6fbf9a', 'stroke-width': 5, fill: 'none' }));

  // Cardiac arrest: a rescuer's hands on the lower breastbone, pressing down.
  const cpr = el('g', { class: 'dev dev-cpr', 'aria-hidden': 'true' },
    // The rescuer works from the patient's side, so the arms come in from the right, clear of the face.
    el('g', { class: 'compress' },
      el('path', { d: 'M 530 40 L 350 220', stroke: '#2b6e8a', 'stroke-width': 44, 'stroke-linecap': 'round', fill: 'none' }),
      el('path', { d: 'M 356 214 L 296 262', stroke: '#c98f6a', 'stroke-width': 30, 'stroke-linecap': 'round', fill: 'none' }),
      el('ellipse', { cx: 270, cy: 274, rx: 30, ry: 19, fill: '#d9a07a', stroke: '#9c6a48', 'stroke-width': 2.5 }),
      el('ellipse', { cx: 266, cy: 266, rx: 24, ry: 14, fill: '#e0ab86', stroke: '#9c6a48', 'stroke-width': 2.5 })));

  const drain = el('g', { class: 'dev dev-drain', 'aria-hidden': 'true' },
    el('path', { d: 'M 258 392 C 300 420 330 470 340 520', fill: 'none', stroke: '#b85a5a', 'stroke-width': 3.5 }),
    el('rect', { x: 316, y: 516, width: 46, height: 38, rx: 9, fill: 'rgba(200,90,90,.82)', stroke: '#8a3b3b', 'stroke-width': 2 }));

  // Leads, the BP hose and the finger wire run off the sides of the picture.
  const wire = (d, color, width) => el('path', { d, stroke: color, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round' });
  const wires = el('g', { class: 'wires', 'aria-hidden': 'true' },
    wire('M 150 238 C 110 230 50 250 0 262', '#7a6f6a', 1.8), wire('M 158 392 C 100 400 40 420 0 430', '#7a6f6a', 1.8),
    wire('M 370 238 C 420 232 480 250 520 258', '#7a6f6a', 1.8), wire('M 362 392 C 430 400 480 420 520 428', '#7a6f6a', 1.8),
    wire('M 404 300 C 450 310 490 330 520 340', '#2b5379', 3.2), wire('M 432 466 C 470 480 500 500 520 512', '#2d3438', 2.2),
    el('path', { class: 'dev dev-pads', d: 'M 214 236 C 240 300 300 400 330 360 M 340 380 C 400 440 470 500 520 540', stroke: '#e58b2a', 'stroke-width': 3, fill: 'none' }),
    el('path', { class: 'dev dev-probe', d: 'M 322 302 C 400 320 470 360 520 380', stroke: '#26343a', 'stroke-width': 4, fill: 'none' }));

  // Labels for each listening site, shown when the stethoscope is in hand.
  const labels = el('g', { class: 'site-labels', 'aria-hidden': 'true' },
    ZONES.filter((z) => z.text).map((z) => el('text', { x: z.lx, y: z.ly, 'text-anchor': z.anchor, class: 'site-label' }, z.text)));

  // The stethoscope chest-piece, shown where the learner last listened.
  // The outer group is positioned with a transform attribute. The inner group is animated, because a
  // CSS animation on `transform` would otherwise replace that attribute and move the graphic.
  const chestpiece = el('g', { class: 'chestpiece', 'aria-hidden': 'true' },
    el('path', { d: 'M 0 -10 C 30 -60 60 -100 110 -130', stroke: '#2d3438', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
    el('circle', { r: 13, fill: '#cfd6da', stroke: '#2d3438', 'stroke-width': 3 }),
    el('circle', { r: 6, fill: '#9aa6ad' }));
  const chestHolder = el('g', { class: 'chestholder', 'aria-hidden': 'true' }, chestpiece);

  // Body sites.
  const zoneEls = ZONES.map((z) => {
    const g = el('g', { class: 'zone', tabindex: '0', role: 'button', 'aria-label': z.label, 'data-action': z.action, 'data-tool': z.tool, 'data-zone': z.id, ...(z.area ? { 'data-area': z.area } : {}) },
      el('circle', { class: 'zone-hit', cx: z.x, cy: z.y, r: z.r + 8, fill: 'transparent' }),
      el('circle', { class: 'zone-ring', cx: z.x, cy: z.y, r: z.r, fill: 'none' }));
    const fire = () => onZone(z);
    g.addEventListener('click', fire);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
    return g;
  });

  svg.append(...(hairBack ? [hairBack] : []), breathe, head, mask, cpr, drain, wires, labels, chestHolder, ...zoneEls);

  const root = document.createElement('div');
  root.className = 'scene';
  root.append(svg);

  function update(s, extras = {}) {
    const m = sceneModel(def, s, extras);
    const d = svg.dataset;
    d.dead = String(m.dead); d.unresponsive = String(m.unresponsive); d.sweat = String(m.sweat); d.jvp = String(m.jvp);
    d.edema = String(m.edema); d.dyspnea = String(m.dyspnea); d.distress = String(m.distress); d.iv = String(m.iv);
    d.pads = String(m.pads); d.cpr = String(m.cpr); d.drain = String(m.drain); d.probe = String(m.probe);
    d.mask = m.mask ?? 'none'; d.cyanosis = String(m.cyanosis); d.breathing = String(m.breathing);
    svg.style.setProperty('--skin', mix(person.skin, '#cfc6c0', m.pallor * 0.65));
    svg.style.setProperty('--lip', m.cyanosis ? '#4d5f9a' : '#7a3b36');
    svg.style.setProperty('--breath', m.breathSeconds ? `${m.breathSeconds.toFixed(2)}s` : '0s');
    svg.style.setProperty('--breath-depth', m.dyspnea ? '1.05' : '1.025');
    return m;
  }

  /** Put a tool in hand. The stethoscope zooms in on the chest. */
  function setTool(tool) {
    svg.dataset.tool = tool ?? 'none';
    svg.setAttribute('viewBox', tool === 'stethoscope' ? VIEW.chest : VIEW.full);
  }

  /** Show the stethoscope at the site that was just used. */
  function flashZone(zone) {
    const g = zoneEls.find((e) => e.dataset.zone === zone.id);
    if (!g) return;
    g.classList.remove('used'); void g.getBoundingClientRect(); g.classList.add('used');
    chestHolder.setAttribute('transform', `translate(${zone.x} ${zone.y})`);
    chestpiece.classList.remove('on'); void chestpiece.getBoundingClientRect(); chestpiece.classList.add('on');
    setTimeout(() => { g.classList.remove('used'); chestpiece.classList.remove('on'); }, 1200);
  }

  return { el: root, svg, update, setTool, flashZone, zones: zoneEls };
}
