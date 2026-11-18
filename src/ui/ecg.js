// ECG signal generation (pure, testable) and sweeping canvas traces.

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
      base,
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

  _beatAt(t) {
    while (this.nextStart <= t) this._nextBeat();
    if (this.nextStart - t > 30) this.nextStart = t; // time jumped backwards or stalled
    let beat = this.beats.find((b) => t >= b.start && t < b.start + b.rr);
    if (!beat) { this._nextBeat(); beat = this.beats[this.beats.length - 1]; }
    return beat;
  }

  /** Signal at time `t` seconds. Call with non-decreasing t. */
  sample(t) {
    const { rhythm } = this.params;
    if (rhythm === 'asystole') return 0.01 * Math.sin(t * 7.1);
    if (rhythm === 'vf') {
      return 0.5 * Math.sin(t * 19 + Math.sin(t * 3.1) * 2) + 0.3 * Math.sin(t * 31 + 1.3) + 0.15 * Math.sin(t * 7.7);
    }
    const beat = this._beatAt(t);
    const phase = (t - beat.start) / beat.rr;
    let v = beatValue(phase, beat);
    if (rhythm === 'afib') v += 0.035 * Math.sin(t * 52) + 0.025 * Math.sin(t * 37 + 1);
    return v;
  }

  /**
   * Finger pulse-oximeter waveform: a pulse wave that follows each heartbeat after a short
   * delay. `pulsePressure` (systolic minus diastolic) scales its height.
   */
  pleth(t, pulsePressure = 50) {
    const { rhythm } = this.params;
    if (rhythm === 'asystole' || rhythm === 'vf') return 0;
    const beat = this._beatAt(t);
    const ph = ((t - beat.start) / beat.rr + 0.8) % 1;
    const amp = Math.min(1.3, Math.max(0.15, pulsePressure / 50)) * (rhythm === 'afib' ? Math.min(1.2, beat.rr / beat.base) : 1);
    return amp * (0.95 * g(ph, 0.22, 0.09) + 0.28 * g(ph, 0.48, 0.08));
  }

  /** R-wave times (seconds) that fall in (from, to]. Used to time the monitor beep. */
  rWaves(from, to) {
    const { rhythm } = this.params;
    if (rhythm === 'asystole' || rhythm === 'vf') return [];
    return this.beats.map((b) => b.start + 0.245 * b.rr).filter((r) => r > from && r <= to);
  }
}

/**
 * Sweeping traces on one or more canvases, all driven by one shared sampler so the ECG,
 * the pleth wave and the beep stay in step.
 *
 * items: [{ canvas, color, kind: 'ecg' | 'pleth' }]
 * getParams() returns { rhythm, hr, ecg, pulsePressure }.
 * Returns { stop }.
 */
export function startTraces(items, getParams, { seconds = 4, onBeat } = {}) {
  const sampler = new EcgSampler();
  let raf = 0;
  let t0 = null;
  let lastT = 0;

  const panels = items.map((item) => {
    const ctx = item.canvas.getContext('2d');
    const panel = { ...item, ctx, lastX: 0, lastY: null, w: 0, h: 0 };
    panel.resize = () => {
      const dpr = window.devicePixelRatio || 1;
      panel.w = item.canvas.clientWidth || 300;
      panel.h = item.canvas.clientHeight || 100;
      item.canvas.width = Math.round(panel.w * dpr);
      item.canvas.height = Math.round(panel.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, panel.w, panel.h);
      panel.lastX = 0;
      panel.lastY = null;
    };
    panel.resize();
    panel.ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(panel.resize) : null;
    panel.ro?.observe(item.canvas);
    return panel;
  });

  const yFor = (panel, v) => (panel.kind === 'pleth'
    ? panel.h * 0.86 - v * panel.h * 0.62
    : panel.h * 0.62 - v * panel.h * 0.45);

  function frame(now) {
    if (t0 == null) t0 = now;
    const t = (now - t0) / 1000;
    const params = getParams();
    sampler.setParams(params);

    for (const p of panels) {
      const x = ((t % seconds) / seconds) * p.w;
      if (x < p.lastX) { p.lastX = 0; p.lastY = null; }
      p.ctx.strokeStyle = p.color;
      p.ctx.lineWidth = 2;
      p.ctx.lineJoin = 'round';
      p.ctx.beginPath();
      const steps = Math.max(1, Math.ceil((x - p.lastX) / 2));
      for (let i = 0; i <= steps; i++) {
        const xi = p.lastX + ((x - p.lastX) * i) / steps;
        const ti = t - ((x - xi) / p.w) * seconds;
        const v = p.kind === 'pleth' ? sampler.pleth(ti, params.pulsePressure) : sampler.sample(ti);
        const y = yFor(p, v);
        if (p.lastY == null && i === 0) p.ctx.moveTo(xi, y); else if (i === 0) p.ctx.moveTo(p.lastX, p.lastY); else p.ctx.lineTo(xi, y);
        if (i === steps) p.lastY = y;
      }
      p.ctx.stroke();
      p.ctx.clearRect(x + 1, 0, 14, p.h); // small gap ahead of the sweep head
      p.lastX = x;
    }

    if (onBeat) for (let i = sampler.rWaves(lastT, t).length; i > 0; i--) onBeat(params);
    lastT = t;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return { stop() { cancelAnimationFrame(raf); panels.forEach((p) => p.ro?.disconnect()); } };
}

/** One sweeping ECG trace. Kept for simple uses. */
export function startEcgRenderer(canvas, getParams, { seconds = 4, color = '#4be38f', onBeat } = {}) {
  return startTraces([{ canvas, color, kind: 'ecg' }], getParams, { seconds, onBeat });
}
