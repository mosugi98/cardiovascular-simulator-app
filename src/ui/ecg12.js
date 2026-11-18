// 12-lead ECG: a lead-by-lead morphology model and a renderer that draws it on ECG paper.
// All values are simulation values in millivolts (1 mV = 10 mm on the paper). Not clinically reviewed.

const g = (x, c, w) => Math.exp(-((x - c) ** 2) / (2 * w * w));
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const LEADS = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

/** Printed layout: four columns of 2.5 seconds, each showing three leads, plus a rhythm strip. */
export const LAYOUT = [['I', 'II', 'III'], ['aVR', 'aVL', 'aVF'], ['V1', 'V2', 'V3'], ['V4', 'V5', 'V6']];

const L = (p, q, r, s, t) => ({ p, q, r, s, t, st: 0, pr: 0 });

/** A normal 12-lead: P, Q, R, S and T heights (mV), J-point offset (st) and PR segment offset (pr). */
export const BASE_LEADS = Object.freeze({
  I: L(0.1, -0.05, 0.6, -0.1, 0.2),
  II: L(0.15, -0.05, 1.0, -0.15, 0.3),
  III: L(0.08, -0.1, 0.5, -0.1, 0.15),
  aVR: L(-0.12, 0, 0.1, -0.8, -0.25),
  aVL: L(0.05, -0.05, 0.35, -0.2, 0.1),
  aVF: L(0.12, -0.05, 0.75, -0.1, 0.25),
  V1: L(0.05, 0, 0.25, -1.0, 0.0),
  V2: L(0.06, 0, 0.5, -1.1, 0.3),
  V3: L(0.08, 0, 0.8, -0.8, 0.35),
  V4: L(0.1, -0.05, 1.1, -0.4, 0.4),
  V5: L(0.1, -0.05, 1.1, -0.15, 0.35),
  V6: L(0.1, -0.05, 0.9, -0.05, 0.3),
});

/**
 * Patterns. `leads` lists only the values that differ from a normal ECG. `width` stretches the QRS
 * (1 = normal, about 2.2 = a wide bundle branch block complex).
 */
export const ECG_PATTERNS = Object.freeze({
  normal: { label: 'Normal morphology', width: 1, leads: {} },
  'anterior-stemi': {
    label: 'Anterior STEMI: ST elevation V1 to V4 with tall T waves in V2 and V3, mild ST elevation in I and aVL, reciprocal ST depression in II, III and aVF',
    width: 1,
    leads: {
      V1: { st: 0.2 }, V2: { st: 0.4, t: 0.55 }, V3: { st: 0.4, t: 0.55 }, V4: { st: 0.3 }, V5: { st: 0.1 },
      I: { st: 0.1 }, aVL: { st: 0.15 }, II: { st: -0.1 }, III: { st: -0.15 }, aVF: { st: -0.12 },
    },
  },
  'anterior-stemi-reperfused': {
    label: 'Anterior STEMI after reperfusion: ST elevation falling and T waves inverting in V1 to V4',
    width: 1,
    leads: {
      V1: { st: 0.05, t: -0.1 }, V2: { st: 0.08, t: -0.25 }, V3: { st: 0.08, t: -0.3 }, V4: { st: 0.05, t: -0.25 },
    },
  },
  'low-voltage': {
    label: 'Low voltage: all complexes about half height (set by the case), with electrical alternans',
    width: 1,
    leads: {},
  },
  pericarditis: {
    label: 'Pericarditis: diffuse ST elevation with PR segment depression, and the opposite in aVR',
    width: 1,
    leads: {
      I: { st: 0.1, pr: -0.05 }, II: { st: 0.12, pr: -0.06 }, III: { st: 0.05, pr: -0.04 }, aVF: { st: 0.1, pr: -0.05 },
      aVR: { st: -0.12, pr: 0.06 },
      V2: { st: 0.12, pr: -0.04 }, V3: { st: 0.12, pr: -0.05 }, V4: { st: 0.12, pr: -0.05 }, V5: { st: 0.12, pr: -0.05 }, V6: { st: 0.12, pr: -0.05 },
    },
  },
  lbbb: {
    label: 'Left bundle branch block: wide QRS, deep S or QS waves in V1 to V3 with ST elevation, broad R waves in I, aVL, V5 and V6 with ST depression and inverted T waves',
    width: 2.2,
    leads: {
      V1: { r: 0.05, s: -1.3, st: 0.25, t: 0.35 }, V2: { r: 0.05, s: -1.6, st: 0.3, t: 0.4 }, V3: { r: 0.1, s: -1.2, st: 0.2, t: 0.3 },
      V4: { r: 0.4, s: -0.6, st: 0, t: 0.1 },
      V5: { q: 0, r: 1.1, s: 0, st: -0.12, t: -0.3 }, V6: { q: 0, r: 1.0, s: 0, st: -0.15, t: -0.3 },
      I: { q: 0, r: 0.9, s: 0, st: -0.1, t: -0.3 }, aVL: { q: 0, r: 0.7, s: 0, st: -0.15, t: -0.3 },
      II: { r: 0.7, s: -0.1, st: 0.05, t: 0.2 }, III: { r: 0.3, s: -0.5, st: 0.1, t: 0.2 }, aVF: { r: 0.5, s: -0.3, st: 0.08, t: 0.2 },
      aVR: { r: 0, s: -0.9, st: 0.1, t: 0.2 },
    },
  },
});

export function leadParams(patternName, lead) {
  const pattern = ECG_PATTERNS[patternName] ?? ECG_PATTERNS.normal;
  return { ...BASE_LEADS[lead], ...(pattern.leads[lead] ?? {}) };
}

/** One beat in one lead. */
export function leadBeat(phase, lp, { width = 1, pAmp = 1, amp = 1, alt = 1 } = {}) {
  const qrs = lp.q * g(phase, 0.22, 0.008 * width) + lp.r * g(phase, 0.245, 0.01 * width) + lp.s * g(phase, 0.27, 0.01 * width);
  const p = pAmp * lp.p * g(phase, 0.1, 0.025);
  const t = lp.t * g(phase, 0.52, 0.05);
  const stStart = 0.27 + 0.02 * width;
  const st = lp.st * smooth(stStart, stStart + 0.03, phase) * (1 - smooth(0.55, 0.7, phase));
  const pr = lp.pr * smooth(0.13, 0.16, phase) * (1 - smooth(0.21, 0.225, phase));
  return amp * alt * (qrs + p + t) + st + pr;
}

/** Beat times for the whole printout, shared by every lead so the beats line up across leads. */
export function buildBeats({ rhythm, hr, ecg = {} }, seconds, random = Math.random) {
  const base = 60 / Math.max(20, Math.min(220, hr));
  const beats = [];
  let t = -0.3;
  let n = 0;
  while (t < seconds + 1) {
    const rr = rhythm === 'afib' ? base * (0.55 + 0.9 * random()) : base;
    beats.push({ start: t, rr, alt: ecg.alternans ? (n % 2 === 0 ? 1 : 0.6) : 1, pAmp: rhythm === 'afib' ? 0 : 1 });
    t += rr;
    n++;
  }
  return beats;
}

export function leadValue(t, beats, lead, { rhythm, ecg = {} }) {
  const pattern = ECG_PATTERNS[ecg.pattern] ?? ECG_PATTERNS.normal;
  const beat = beats.find((b) => t >= b.start && t < b.start + b.rr) ?? beats[beats.length - 1];
  const phase = (t - beat.start) / beat.rr;
  let v = leadBeat(phase, leadParams(ecg.pattern ?? 'normal', lead), { width: pattern.width, pAmp: beat.pAmp, amp: ecg.amp ?? 1, alt: beat.alt });
  if (rhythm === 'afib') v += 0.035 * Math.sin(t * 52) + 0.025 * Math.sin(t * 37 + 1);
  return v;
}

/* ---------- paper ---------- */
export const PAPER = Object.freeze({ width: 1070, height: 580, mm: 4, margin: 46, rowHeight: 120, top: 40, rhythmTop: 400 });

const INK = '#1c1413';
const MONO = "'Atkinson Hyperlegible Mono', ui-monospace, monospace";

function drawGrid(ctx, w, h) {
  ctx.fillStyle = '#fbe4e0';
  ctx.fillRect(0, 0, w, h);
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += PAPER.mm) {
    ctx.strokeStyle = x % (PAPER.mm * 5) === 0 ? '#e08b82' : '#f3bdb5';
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += PAPER.mm) {
    ctx.strokeStyle = y % (PAPER.mm * 5) === 0 ? '#e08b82' : '#f3bdb5';
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
  }
}

function drawTrace(ctx, x0, baseline, t0, seconds, sampleAt) {
  const px = seconds * 25 * PAPER.mm;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= px; i++) {
    const v = sampleAt(t0 + (i / px) * seconds);
    const y = baseline - v * 10 * PAPER.mm;
    if (i === 0) ctx.moveTo(x0 + i, y); else ctx.lineTo(x0 + i, y);
  }
  ctx.stroke();
}

function drawCalibration(ctx, x, baseline) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x, baseline); ctx.lineTo(x + 4, baseline); ctx.lineTo(x + 4, baseline - 40);
  ctx.lineTo(x + 24, baseline - 40); ctx.lineTo(x + 24, baseline); ctx.lineTo(x + 30, baseline);
  ctx.stroke();
}

/**
 * Draw a 10 second, 12-lead printout. `snapshot` is { rhythm, hr, ecg, heading }.
 * Beats are random in atrial fibrillation, so pass `random` to make a print repeatable.
 */
export function renderEcg12(canvas, snapshot, random = Math.random) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(PAPER.width * dpr);
  canvas.height = Math.round(PAPER.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawGrid(ctx, PAPER.width, PAPER.height);

  const beats = buildBeats(snapshot, 10.5, random);
  const sampleFor = (lead) => (t) => leadValue(t, beats, lead, snapshot);

  ctx.fillStyle = INK;
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText(snapshot.heading ?? '12-lead ECG', PAPER.margin, 22);
  ctx.font = `13px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(`25 mm/s   10 mm/mV   Rate ${Math.round(snapshot.hr)}/min`, PAPER.width - 14, 22);
  ctx.textAlign = 'left';

  LAYOUT.forEach((column, c) => {
    column.forEach((lead, r) => {
      const baseline = PAPER.top + r * PAPER.rowHeight + 66;
      const x0 = PAPER.margin + c * 2.5 * 25 * PAPER.mm;
      drawTrace(ctx, x0, baseline, c * 2.5, 2.5, sampleFor(lead));
      ctx.fillStyle = INK;
      ctx.font = `600 14px ${MONO}`;
      ctx.fillText(lead, x0 + 4, baseline - 44);
      if (c > 0) { ctx.fillRect(x0 - 1, baseline - 6, 2, 12); }
    });
  });
  for (let r = 0; r < 3; r++) drawCalibration(ctx, 8, PAPER.top + r * PAPER.rowHeight + 66);

  const rhythmBaseline = PAPER.rhythmTop + 80;
  drawTrace(ctx, PAPER.margin, rhythmBaseline, 0, 10, sampleFor('II'));
  drawCalibration(ctx, 8, rhythmBaseline);
  ctx.fillStyle = INK;
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('II', PAPER.margin + 4, rhythmBaseline - 44);
  ctx.font = `12px ${MONO}`;
  ctx.fillText('Simulated tracing for teaching. Not a recording.', PAPER.margin, PAPER.height - 14);
}
