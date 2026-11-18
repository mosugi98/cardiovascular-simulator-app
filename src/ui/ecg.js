// ECG signal generation (pure, testable) and a sweeping canvas renderer.

const g = (x, c, w) => Math.exp(-((x - c) ** 2) / (2 * w * w));
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** One heartbeat. `phase` runs 0..1 across the beat. Values are in millivolts. */
export function beatValue(phase, { amp = 1, stElev = 0, pAmp = 1, alt = 1 } = {}) {
  const qrs = -0.12 * g(phase, 0.22, 0.008) + 1.0 * g(phase, 0.245, 0.01) - 0.25 * g(phase, 0.27, 0.01);
  const p = pAmp * 0.15 * g(phase, 0.1, 0.025);
  const t = 0.3 * g(phase, 0.52, 0.05);
  // ST elevation: raised from the J point, merging into the T wave.
  const st = stElev * smooth(0.27, 0.3, phase) * (1 - smooth(0.55, 0.7, phase));
  return amp * alt * (qrs + p + t) + st;
}

/** Plain-language description, used as the text equivalent for the ECG. */
export function describeRhythm(rhythm, hr, ecg = {}) {
  const rate = Math.round(hr);
  const extras = [];
  if (ecg.stElev >= 0.15) extras.push('ST elevation');
  if (ecg.amp != null && ecg.amp < 0.8) extras.push('low voltage');
  if (ecg.alternans) extras.push('electrical alternans');
  const tail = extras.length ? `, with ${extras.join(' and ')}` : '';
  switch (rhythm) {
    case 'afib': return `Atrial fibrillation: irregularly irregular, about ${rate} beats per minute${tail}`;
    case 'vf': return 'Ventricular fibrillation: chaotic electrical activity, no effective heartbeat';
    case 'asystole': return 'Asystole: no electrical activity';
    default: return `Sinus rhythm, regular, about ${rate} beats per minute${tail}`;
  }
}

/** Builds the signal beat by beat as time advances. */
export class EcgSampler {
  constructor(random = Math.random) {
    this.random = random;
    this.params = { rhythm: 'sinus', hr: 80, ecg: {} };
    this.beats = [];
    this.nextStart = 0;
    this.n = 0;
  }

  setParams(params) { this.params = params; }

  _nextBeat() {
    const { rhythm, hr, ecg } = this.params;
    const base = 60 / Math.max(20, Math.min(220, hr));
    const rr = rhythm === 'afib' ? base * (0.55 + 0.9 * this.random()) : base;
    const beat = {
      start: this.nextStart,
      rr,
      amp: ecg.amp ?? 1,
      stElev: ecg.stElev ?? 0,
      pAmp: rhythm === 'afib' ? 0 : 1,
      alt: ecg.alternans ? (this.n % 2 === 0 ? 1 : 0.6) : 1,
    };
    this.nextStart += rr;
    this.n += 1;
    this.beats.push(beat);
    if (this.beats.length > 12) this.beats.shift();
  }

  /** Signal at time `t` seconds. Call with non-decreasing t. */
  sample(t) {
    const { rhythm } = this.params;
    if (rhythm === 'asystole') return 0.01 * Math.sin(t * 7.1);
    if (rhythm === 'vf') {
      return 0.5 * Math.sin(t * 19 + Math.sin(t * 3.1) * 2) + 0.3 * Math.sin(t * 31 + 1.3) + 0.15 * Math.sin(t * 7.7);
    }
    while (this.nextStart <= t) this._nextBeat();
    if (this.nextStart - t > 30) this.nextStart = t; // time jumped backwards or stalled
    let beat = this.beats.find((b) => t >= b.start && t < b.start + b.rr);
    if (!beat) { this._nextBeat(); beat = this.beats[this.beats.length - 1]; }
    const phase = (t - beat.start) / beat.rr;
    let v = beatValue(phase, beat);
    if (rhythm === 'afib') v += 0.035 * Math.sin(t * 52) + 0.025 * Math.sin(t * 37 + 1);
    return v;
  }
}

/**
 * Sweeping ECG trace on a canvas. `getParams()` returns { rhythm, hr, ecg }.
 * Returns { stop }.
 */
export function startEcgRenderer(canvas, getParams, { seconds = 4, color = '#0a7d3e' } = {}) {
  const ctx = canvas.getContext('2d');
  const sampler = new EcgSampler();
  let raf = 0;
  let t0 = null;
  let lastX = 0;
  let lastY = null;
  let cssW = 0;
  let cssH = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    cssW = canvas.clientWidth || 300;
    cssH = canvas.clientHeight || 120;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    lastX = 0;
    lastY = null;
  }
  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(canvas);

  const yFor = (v) => cssH * 0.62 - v * cssH * 0.45;

  function frame(now) {
    if (t0 == null) t0 = now;
    const t = (now - t0) / 1000;
    sampler.setParams(getParams());
    const x = ((t % seconds) / seconds) * cssW;

    if (x < lastX) { lastX = 0; lastY = null; }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const steps = Math.max(1, Math.ceil((x - lastX) / 2));
    for (let i = 0; i <= steps; i++) {
      const xi = lastX + ((x - lastX) * i) / steps;
      const ti = t - ((x - xi) / cssW) * seconds;
      const y = yFor(sampler.sample(ti));
      if (lastY == null && i === 0) ctx.moveTo(xi, y); else if (i === 0) ctx.moveTo(lastX, lastY); else ctx.lineTo(xi, y);
      if (i === steps) lastY = y;
    }
    ctx.stroke();
    // Clear a small gap ahead of the sweep head.
    ctx.clearRect(x + 1, 0, 14, cssH);
    lastX = x;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return { stop() { cancelAnimationFrame(raf); ro?.disconnect(); } };
}
