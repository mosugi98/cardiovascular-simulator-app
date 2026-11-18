// The probandus: a patient on a resus-bay trolley, drawn as SVG.
// Body zones are real buttons. Devices (oxygen mask, IV, pads) appear as the learner treats.

const NS = 'http://www.w3.org/2000/svg';

/** Treatments given through an IV line. */
export const IV_TREATMENTS = ['heparin', 'metoprolol', 'diltiazem', 'furosemide', 'fluids', 'norepi'];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Which action each body zone performs, and which tool is the natural one for it. */
export const ZONES = Object.freeze([
  { id: 'face', action: 'inspect', tool: 'look', label: 'Look at the patient: face and general appearance', x: 8, y: -246, r: 38 },
  { id: 'neck', action: 'jvp', tool: 'hands', label: 'Check the neck veins (JVP)', x: 14, y: -198, r: 17 },
  { id: 'lungs', action: 'lungs', tool: 'stethoscope', label: 'Listen to the lungs: upper chest', x: 30, y: -152, r: 21 },
  { id: 'heart', action: 'heartSounds', tool: 'stethoscope', label: 'Listen to the heart: lower left chest', x: 32, y: -110, r: 23 },
  { id: 'wrist', action: 'pulses', tool: 'hands', label: 'Feel the wrist pulse and check perfusion', x: 56, y: -28, r: 19 },
]);

/** What the scene should show for this moment of a case. Pure, so it can be tested. */
export function sceneModel(def, s, { probeOn = false } = {}) {
  const v = s.vitals;
  const sev = s.severity;
  const given = new Set(s.log.filter((e) => e.kind === 'treat').map((e) => e.id));
  const done = new Set(s.log.filter((e) => e.kind !== 'event').map((e) => e.id));
  const dead = s.status === 'dead';
  const stable = s.status === 'stabilized';
  return {
    dead,
    pallor: dead ? 1 : clamp((sev - 0.2) / 0.7, 0, 1),
    sweat: !dead && !stable && !!def.look.sweaty && sev > 0.3,
    cyanosis: !dead && v.spo2 < 88,
    jvp: !!def.look.jvp(s),
    edema: !!def.look.edema,
    dyspnea: !dead && !!def.look.dyspnea(s),
    distress: !dead && !stable && sev > 0.5,
    mask: given.has('niv') ? 'niv' : given.has('oxygen') ? 'o2' : null,
    iv: IV_TREATMENTS.some((id) => given.has(id)),
    pads: given.has('cardioversion'),
    drain: !!s.flags.drained,
    probe: probeOn && done.has('echo') && !dead,
    breathSeconds: dead ? 0 : clamp(60 / Math.max(6, v.rr), 1.2, 8),
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
 * Build the scene. `onZone(zone)` is called when a body zone is pressed.
 * Returns { el, update(state, extras), setTool(toolId) }.
 */
export function createScene(def, onZone) {
  const person = def.person;
  const upright = person.pose === 'upright';
  const angle = upright ? -16 : -42;
  const hip = { x: 350, y: 268 };
  const rad = (angle * Math.PI) / 180;
  const world = (lx, ly) => [hip.x + lx * Math.cos(rad) - ly * Math.sin(rad), hip.y + lx * Math.sin(rad) + ly * Math.cos(rad)];
  const female = person.sex === 'woman';

  const svg = el('svg', { viewBox: '0 -44 780 484', class: 'scene-svg', role: 'group', 'aria-label': `Probandus: ${person.age}-year-old ${person.sex} on a trolley. Body zones are buttons.` });
  svg.style.setProperty('--skin', person.skin);
  svg.style.setProperty('--hair', person.hair);

  // Floor and bed.
  svg.append(
    el('ellipse', { cx: 390, cy: 418, rx: 340, ry: 12, fill: 'rgba(20,50,60,.18)' }),
    el('rect', { x: 118, y: 326, width: 570, height: 12, rx: 4, fill: '#6d7d84' }),
    el('rect', { x: 146, y: 336, width: 8, height: 50, fill: '#8795a0' }),
    el('rect', { x: 646, y: 336, width: 8, height: 50, fill: '#8795a0' }),
    el('circle', { cx: 150, cy: 394, r: 16, fill: '#39454b' }),
    el('circle', { cx: 650, cy: 394, r: 16, fill: '#39454b' }),
    el('circle', { cx: 150, cy: 394, r: 6, fill: '#9aa8b0' }),
    el('circle', { cx: 650, cy: 394, r: 6, fill: '#9aa8b0' }),
    el('rect', { x: 84, y: 282, width: 624, height: 26, rx: 12, fill: '#c3d0d5' }),
    el('rect', { x: 84, y: 300, width: 624, height: 28, rx: 6, fill: '#a9b8be' }),
  );

  // IV pole, bag and drain bag (shown when used).
  const [wx, wy] = world(54, -30);
  const ivGroup = el('g', { class: 'dev dev-iv', 'aria-hidden': 'true' },
    el('rect', { x: 733, y: 70, width: 5, height: 320, fill: '#8795a0' }),
    el('path', { d: 'M 718 76 L 752 76', stroke: '#8795a0', 'stroke-width': 5, 'stroke-linecap': 'round' }),
    el('rect', { x: 710, y: 82, width: 30, height: 56, rx: 8, fill: 'rgba(210,235,245,.85)', stroke: '#6fa0b5', 'stroke-width': 2 }),
    el('rect', { x: 714, y: 108, width: 22, height: 26, rx: 5, fill: 'rgba(150,200,225,.8)' }),
    el('path', { d: `M 725 138 C 725 190 ${wx + 120} 200 ${wx + 6} ${wy - 2}`, fill: 'none', stroke: 'rgba(120,170,190,.9)', 'stroke-width': 2.5 }),
  );
  const drainGroup = el('g', { class: 'dev dev-drain', 'aria-hidden': 'true' },
    el('path', { d: `M ${world(36, -58)[0]} ${world(36, -58)[1]} C 430 300 420 350 452 356`, fill: 'none', stroke: '#b85a5a', 'stroke-width': 3 }),
    el('rect', { x: 444, y: 352, width: 42, height: 34, rx: 8, fill: 'rgba(200,90,90,.8)', stroke: '#8a3b3b', 'stroke-width': 2 }),
  );
  svg.append(ivGroup, drainGroup);

  // Legs under the sheet. Lower legs are bare, and swell in heart failure.
  const knee = [512, 232];
  const ankle = [650, 264];
  const legs = el('g', { class: 'legs' },
    el('path', { d: `M ${hip.x} ${hip.y - 6} L ${knee[0]} ${knee[1]}`, stroke: '#e6edef', 'stroke-width': 58, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: `M ${knee[0]} ${knee[1]} L ${ankle[0]} ${ankle[1] - 4}`, stroke: 'var(--skin)', 'stroke-width': 30, 'stroke-linecap': 'round', fill: 'none', class: 'shin' }),
    el('ellipse', { cx: ankle[0] + 18, cy: ankle[1] + 4, rx: 22, ry: 11, fill: 'var(--skin)', class: 'foot' }),
    el('path', { d: `M ${hip.x - 12} ${hip.y - 30} Q ${knee[0] - 40} ${knee[1] - 40} ${knee[0] + 14} ${knee[1] - 22} L ${knee[0] + 22} ${knee[1] + 24} Q ${knee[0] - 40} ${knee[1] + 30} ${hip.x - 6} ${hip.y + 18} Z`, fill: '#e6edef' }),
    el('path', { d: `M ${hip.x + 20} ${hip.y - 28} Q ${knee[0] - 40} ${knee[1] - 38} ${knee[0] + 14} ${knee[1] - 22}`, stroke: '#cdd9dc', 'stroke-width': 3, fill: 'none' }),
  );
  const pitting = el('g', { class: 'edema-marks', 'aria-hidden': 'true' },
    [0.3, 0.5, 0.7].map((t) => el('ellipse', { cx: knee[0] + (ankle[0] - knee[0]) * t, cy: knee[1] + (ankle[1] - knee[1]) * t + 2, rx: 7, ry: 3.5, fill: 'rgba(90,50,40,.28)' })));
  svg.append(legs, pitting);

  // Everything on the body is drawn in the trunk's own coordinates, then rotated into place.
  const body = el('g', { transform: `translate(${hip.x} ${hip.y}) rotate(${angle})` });
  const pad = el('rect', { x: -66, y: -252, width: 30, height: 268, rx: 12, fill: '#9fb0b7' });
  const breathe = el('g', { class: 'breathe' });

  const neck = el('rect', { x: -4, y: -216, width: 26, height: 40, rx: 11, fill: 'var(--skin)' });
  const jvp = el('g', { class: 'jvp', 'aria-hidden': 'true' },
    el('path', { d: 'M 16 -184 C 22 -196 22 -206 16 -214', fill: 'none', stroke: '#5b82b3', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.9 }),
    el('ellipse', { cx: 18, cy: -200, rx: 5, ry: 12, fill: '#6f95c4', opacity: 0.8 }));
  const strain = el('g', { class: 'strain', 'aria-hidden': 'true', stroke: 'rgba(60,30,20,.45)', 'stroke-width': 2, fill: 'none' },
    el('path', { d: 'M 6 -184 L 2 -210' }), el('path', { d: 'M 24 -184 L 28 -208' }));

  const gown = el('path', { d: 'M -34 10 C -40 -50 -38 -120 -26 -176 L -6 -192 L 14 -192 C 34 -178 46 -128 46 -92 C 46 -50 40 -14 32 10 Z', fill: '#9cc8d2', stroke: '#7fb0bc', 'stroke-width': 2 });
  const gownSeam = el('path', { d: 'M 4 -190 C 10 -140 12 -60 8 6', fill: 'none', stroke: '#86b4c0', 'stroke-width': 2, 'stroke-dasharray': '4 5' });

  // Head. Faces right.
  const hairBack = female
    ? el('path', { d: 'M -22 -240 C -44 -250 -40 -190 -28 -176 L -4 -184 C -14 -210 -10 -236 -2 -262 Z', fill: 'var(--hair)' })
    : null;
  const head = el('g', { class: 'head' },
    el('circle', { cx: 8, cy: -246, r: 33, fill: 'var(--skin)' }),
    el('circle', { cx: 0, cy: -242, r: 8, fill: 'var(--skin)', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 1.5 }),
    el('path', { d: 'M -27 -240 C -34 -292 14 -294 38 -266 C 22 -272 6 -266 -2 -250 C -6 -246 -18 -244 -27 -240 Z', fill: 'var(--hair)' }),
    el('path', { d: 'M 38 -246 L 47 -236 L 37 -233', fill: 'var(--skin)', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    el('circle', { class: 'eye eye-open', cx: 23, cy: -252, r: 3.4, fill: '#241a17' }),
    el('path', { class: 'eye eye-shut', d: 'M 19 -252 Q 23 -249 27 -252', fill: 'none', stroke: '#241a17', 'stroke-width': 2 }),
    el('path', { class: 'brow', d: 'M 15 -262 L 30 -262', stroke: '#2a201c', 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
    el('path', { class: 'mouth mouth-closed', d: 'M 20 -226 Q 28 -224 35 -227', fill: 'none', stroke: 'var(--lip)', 'stroke-width': 3, 'stroke-linecap': 'round' }),
    el('ellipse', { class: 'mouth mouth-open', cx: 28, cy: -225, rx: 6.5, ry: 4.5, fill: '#5a2b2b', stroke: 'var(--lip)', 'stroke-width': 2 }),
    el('g', { class: 'drops', 'aria-hidden': 'true' },
      [[14, -272], [2, -266], [28, -270]].map(([x, y], i) => el('path', { class: `drop drop-${i}`, d: `M ${x} ${y} q 3 5 0 8 q -3 -3 0 -8 z`, fill: 'rgba(210,235,245,.95)' }))),
  );

  // Arm: sleeve, forearm resting in the lap, hand.
  const arm = el('g', { class: 'arm' },
    el('path', { d: 'M 2 -160 L 0 -84', stroke: 'var(--skin)', 'stroke-width': 22, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: 'M 0 -84 L 54 -30', stroke: 'var(--skin)', 'stroke-width': 19, 'stroke-linecap': 'round', fill: 'none' }),
    el('ellipse', { cx: 66, cy: -22, rx: 13, ry: 8, transform: 'rotate(28 66 -22)', fill: 'var(--skin)' }),
    el('path', { d: 'M 2 -160 L 1 -122', stroke: '#9cc8d2', 'stroke-width': 27, 'stroke-linecap': 'round', fill: 'none' }),
    el('path', { d: 'M 43 -41 L 50 -35', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'butt', opacity: 0.95 }),
  );
  const cuff = el('g', { class: 'cuff', 'aria-hidden': 'true' },
    el('path', { d: 'M 1 -124 L 0 -96', stroke: '#2b5379', 'stroke-width': 29, 'stroke-linecap': 'butt', fill: 'none' }),
    el('rect', { x: -2, y: -128, width: 6, height: 6, fill: '#2b5379' }));
  const clip = el('g', { class: 'spo2-clip', 'aria-hidden': 'true' },
    el('rect', { x: 66, y: -29, width: 14, height: 9, rx: 3, fill: '#2d3438' }),
    el('circle', { cx: 74, cy: -24, r: 2, fill: '#ff4d4d' }));
  const electrodes = el('g', { class: 'electrodes', 'aria-hidden': 'true' },
    [[40, -146], [37, -118], [30, -88]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 5, fill: '#f1f1f1', stroke: '#9a9a9a', 'stroke-width': 1.5 })));

  // Devices that appear with treatment.
  const mask = el('g', { class: 'dev dev-mask', 'aria-hidden': 'true' },
    el('path', { class: 'mask-o2', d: 'M 30 -254 C 48 -252 54 -230 40 -214 C 30 -206 18 -214 22 -230 Z', fill: 'rgba(120,205,160,.6)', stroke: '#3a9972', 'stroke-width': 2 }),
    el('path', { class: 'mask-niv', d: 'M 22 -264 C 58 -266 64 -226 40 -206 C 24 -200 12 -212 14 -238 Z', fill: 'rgba(225,240,245,.55)', stroke: '#5b93a6', 'stroke-width': 3 }),
    el('path', { d: 'M 26 -260 C 4 -276 -22 -268 -26 -244', stroke: '#e8f1f4', 'stroke-width': 2.5, fill: 'none' }),
    el('path', { d: 'M 38 -214 C 60 -190 80 -140 120 -60 L 150 40', stroke: '#6fbf9a', 'stroke-width': 4, fill: 'none' }));
  const pads = el('g', { class: 'dev dev-pads', 'aria-hidden': 'true' },
    el('rect', { x: 36, y: -168, width: 13, height: 32, rx: 4, fill: '#fafafa', stroke: '#e58b2a', 'stroke-width': 2 }),
    el('rect', { x: 33, y: -112, width: 13, height: 32, rx: 4, fill: '#fafafa', stroke: '#e58b2a', 'stroke-width': 2 }),
    el('path', { d: 'M 44 -134 C 70 -120 90 -80 130 -20 M 40 -80 C 70 -60 100 -30 130 -20', stroke: '#e58b2a', 'stroke-width': 2.5, fill: 'none' }));
  const probe = el('g', { class: 'dev dev-probe', 'aria-hidden': 'true' },
    el('rect', { x: 44, y: -128, width: 17, height: 36, rx: 6, fill: '#26343a', stroke: '#111', 'stroke-width': 1.5 }),
    el('path', { d: 'M 56 -92 C 90 -70 130 -50 190 -20', stroke: '#26343a', 'stroke-width': 4, fill: 'none' }));
  const sweatChest = el('g', { class: 'drops', 'aria-hidden': 'true' },
    [[38, -168], [44, -128], [22, -100]].map(([x, y], i) => el('path', { class: `drop drop-${i}`, d: `M ${x} ${y} q 3 5 0 8 q -3 -3 0 -8 z`, fill: 'rgba(210,235,245,.95)' })));

  // Body zones.
  const zoneEls = ZONES.map((z) => {
    const g = el('g', { class: 'zone', tabindex: '0', role: 'button', 'aria-label': z.label, 'data-action': z.action, 'data-tool': z.tool },
      el('circle', { class: 'zone-hit', cx: z.x, cy: z.y, r: z.r + 8, fill: 'transparent' }),
      el('circle', { class: 'zone-ring', cx: z.x, cy: z.y, r: z.r, fill: 'none' }));
    const fire = () => onZone(z);
    g.addEventListener('click', fire);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
    return g;
  });

  breathe.append(neck, jvp, gown, gownSeam, electrodes, arm, cuff, clip, pads, probe, sweatChest, strain);
  body.append(pad, ...(hairBack ? [hairBack] : []), breathe, head, mask, ...zoneEls);
  svg.append(body);

  // Monitor leads, the BP hose and the finger clip wire run off the top right, clear of the face.
  const wire = (from, to, color, width) => {
    const [sx, sy] = world(...from);
    return el('path', { d: `M ${sx} ${sy} C ${sx + 90} ${sy - 30}, ${to[0] - 60} ${to[1] + 110}, ${to[0]} ${to[1]}`, stroke: color, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round' });
  };
  svg.append(el('g', { class: 'wires', 'aria-hidden': 'true' },
    wire([40, -146], [600, -40], '#7a6f6a', 1.6),
    wire([37, -118], [616, -40], '#7a6f6a', 1.6),
    wire([30, -88], [632, -40], '#7a6f6a', 1.6),
    wire([2, -125], [660, -40], '#2b5379', 3),
    wire([72, -26], [680, -40], '#2d3438', 2)));

  // The sheet over the thighs drawn last so the hand rests on top of it.
  const root = document.createElement('div');
  root.className = 'scene';
  root.append(svg);

  const state = { tool: null };
  function update(s, extras = {}) {
    const m = sceneModel(def, s, extras);
    const d = svg.dataset;
    d.dead = String(m.dead); d.sweat = String(m.sweat); d.jvp = String(m.jvp); d.edema = String(m.edema);
    d.dyspnea = String(m.dyspnea); d.distress = String(m.distress); d.iv = String(m.iv); d.pads = String(m.pads);
    d.drain = String(m.drain); d.probe = String(m.probe); d.mask = m.mask ?? 'none'; d.cyanosis = String(m.cyanosis);
    svg.style.setProperty('--skin', mix(person.skin, '#cfc6c0', m.pallor * 0.65));
    svg.style.setProperty('--lip', m.cyanosis ? '#4d5f9a' : '#7a3b36');
    svg.style.setProperty('--breath', m.breathSeconds ? `${m.breathSeconds.toFixed(2)}s` : '0s');
    svg.style.setProperty('--breath-depth', m.dyspnea ? '1.05' : '1.025');
    return m;
  }
  function setTool(tool) {
    state.tool = tool;
    svg.dataset.tool = tool ?? 'none';
  }
  function flashZone(actionId) {
    const g = zoneEls.find((e) => e.dataset.action === actionId);
    if (!g) return;
    g.classList.remove('used'); void g.getBoundingClientRect(); g.classList.add('used');
    setTimeout(() => g.classList.remove('used'), 900);
  }
  return { el: root, svg, update, setTool, flashZone, zones: zoneEls };
}
