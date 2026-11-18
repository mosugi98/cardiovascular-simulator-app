// Simulated heart and lung sounds, synthesized with the Web Audio API.
// These are approximations made in the browser. They are not recordings.

const SECONDS = 6;

export function createAudio() {
  let ctx = null;
  let muted = false;
  let stopFns = [];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error('Audio is not supported in this browser.');
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(c, at, freq, dur, gain, lowpass) {
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, at);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.6), at + dur);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    let out = amp;
    osc.connect(amp);
    if (lowpass) {
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = lowpass;
      amp.connect(lp);
      out = lp;
    }
    out.connect(c.destination);
    osc.start(at);
    osc.stop(at + dur + 0.05);
    stopFns.push(() => { try { osc.stop(); } catch { /* already stopped */ } });
  }

  function noise(c, at, dur, gain, band) {
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = band;
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + dur * 0.4);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp); bp.connect(amp); amp.connect(c.destination);
    src.start(at);
    stopFns.push(() => { try { src.stop(); } catch { /* already stopped */ } });
  }

  return {
    get muted() { return muted; },
    setMuted(value) { muted = !!value; if (muted) this.stop(); },
    stop() { stopFns.forEach((fn) => fn()); stopFns = []; },

    /** A short monitor tone: the heartbeat beep, or an alarm tone. Silent when muted. */
    beep(freq = 880, dur = 0.09, gain = 0.12) {
      if (muted) return;
      try {
        const c = ensure();
        const at = c.currentTime;
        const osc = c.createOscillator();
        const amp = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        amp.gain.setValueAtTime(0.0001, at);
        amp.gain.exponentialRampToValueAtTime(gain, at + 0.008);
        amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        osc.connect(amp); amp.connect(c.destination);
        osc.start(at); osc.stop(at + dur + 0.03);
      } catch { /* audio is optional */ }
    },

    /** kind: normal | muffled | afib | s3. Returns the duration in seconds. */
    playHeart(kind, hr) {
      if (muted) return 0;
      const c = ensure();
      this.stop();
      const base = 60 / Math.max(40, Math.min(180, hr));
      const gain = kind === 'muffled' ? 0.25 : 0.7;
      const lowpass = kind === 'muffled' ? 110 : undefined;
      let t = c.currentTime + 0.1;
      const end = t + SECONDS;
      while (t < end) {
        const rr = kind === 'afib' ? base * (0.55 + 0.9 * Math.random()) : base;
        tone(c, t, 62, 0.11, gain, lowpass);                 // S1 "lub"
        tone(c, t + Math.min(0.32, rr * 0.38), 85, 0.08, gain * 0.7, lowpass); // S2 "dub"
        if (kind === 's3') tone(c, t + Math.min(0.32, rr * 0.38) + 0.14, 40, 0.1, gain * 0.55); // S3 gallop
        t += rr;
      }
      return SECONDS;
    },

    /** kind: clear | crackles. Returns the duration in seconds. */
    playLungs(kind) {
      if (muted) return 0;
      const c = ensure();
      this.stop();
      let t = c.currentTime + 0.1;
      const end = t + SECONDS;
      const cycle = 3;
      while (t < end) {
        noise(c, t, 1.2, 0.12, 500);           // breathing in
        noise(c, t + 1.6, 1.0, 0.07, 400);     // breathing out
        if (kind === 'crackles') {
          for (let i = 0; i < 12; i++) noise(c, t + 0.1 + Math.random() * 1.0, 0.012, 0.35, 1800 + Math.random() * 1200);
        }
        t += cycle;
      }
      return SECONDS;
    },
  };
}
