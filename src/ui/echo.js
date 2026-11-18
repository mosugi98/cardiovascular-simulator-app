// A simulated apical four-chamber echocardiogram, drawn on a canvas. It is a teaching
// approximation, not a recording. The motion maths is pure so it can be tested.

const SYSTOLE_FRACTION = 0.38;

/** 0 in diastole, rising to 1 and back to 0 during systole. `phase` runs 0..1 across one beat. */
export function contraction(phase) {
  return phase < SYSTOLE_FRACTION ? Math.sin((Math.PI * phase) / SYSTOLE_FRACTION) : 0;
}

/**
 * How much of its relaxed size the left ventricle keeps at angle `theta` (0 = lateral wall, -PI/2 = apex).
 * The cavity area falls by the ejection fraction at peak systole. A weak wall segment moves much less.
 */
export function lvRadiusFactor(echo, c, theta) {
  const apex = Math.sin(theta) < -0.4;
  const w = echo.hypokinesis === 'anterior-apex' && apex ? 0.2 : 1;
  return Math.sqrt(Math.max(0.15, 1 - echo.ef * c * w));
}

/** The right ventricle. In tamponade its free wall is pushed in during early diastole. */
export function rvRadiusFactor(echo, c, theta) {
  const base = Math.sqrt(1 - 0.35 * c);
  const freeWall = Math.cos(theta) < 0;
  const collapse = echo.rvCollapse ? 0.5 * (1 - c) * (freeWall ? 1 : 0.3) : 0;
  return base * (1 - collapse);
}

/** Thickness of the fluid gap between the heart and the pericardium, as a fraction of the picture width. */
export function effusionGap(echo) {
  return 0.012 + echo.effusion * 0.07;
}

/** Text equivalent of what the picture shows. */
export function describeEcho(echo) {
  const parts = [`Apical four-chamber view. Ejection fraction about ${Math.round(echo.ef * 100)}%.`];
  if (echo.effusion > 0.5) parts.push('Large fluid collection around the heart.');
  else if (echo.effusion > 0) parts.push('Small rim of fluid around the heart.');
  if (echo.rvCollapse) parts.push('The right ventricle collapses in diastole.');
  if (echo.hypokinesis) parts.push('The anterior wall and apex move poorly.');
  if (echo.lv > 1.1) parts.push('The left ventricle is dilated.');
  if (echo.la > 1.2) parts.push('The left atrium is enlarged.');
  if (echo.mr) parts.push('A jet of mitral regurgitation is visible.');
  return parts.join(' ');
}

function noiseCanvas(size = 160) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/**
 * Starts the animation. `getState()` returns { echo, hr, rhythm, frozen }.
 * Returns { stop }.
 */
export function startEchoRenderer(canvas, getState) {
  const ctx = canvas.getContext('2d');
  const noise = noiseCanvas();
  let raf = 0;
  let w = 0;
  let h = 0;
  let cycleStart = null;
  let cycleLen = 1;
  let frozenC = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth || 400;
    h = canvas.clientHeight || 360;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  ro?.observe(canvas);

  // A chamber outline. For the ventricles (`dir` +1 left, -1 right) the apex narrows and leans toward
  // the septum, so both apexes meet near the probe at the top, as in a real apical view.
  const ellipsePath = (cx, cy, a, b, fn, dir = 0) => {
    ctx.beginPath();
    const n = 56;
    for (let i = 0; i <= n; i++) {
      const th = (i / n) * Math.PI * 2;
      const f = fn ? fn(th) : 1;
      const s = Math.max(0, -Math.sin(th));
      const taper = dir ? 1 - 0.5 * s ** 1.5 : 1;
      const lean = dir ? dir * 0.9 * a * f * s * s : 0;
      const x = (cx + a * f * Math.cos(th) * taper - lean) * w;
      const y = (cy + b * f * Math.sin(th)) * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  function draw(echo, c, now) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Sector, with the probe at the top.
    const apexX = w * 0.5; const apexY = h * 0.02; const R = h * 0.97; const half = 0.72;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.arc(apexX, apexY, R, Math.PI / 2 - half, Math.PI / 2 + half);
    ctx.closePath();
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.clip();

    // Chamber geometry (fractions of the picture).
    const septum = 0.5;
    const aLv = 0.105 * echo.lv; const bLv = 0.2 * echo.lv; const cxLv = septum + 0.012 + aLv; const cyLv = 0.33 - (echo.lv - 1) * 0.02 + 0.0;
    const aRv = 0.085; const bRv = 0.17; const cxRv = septum - 0.012 - aRv; const cyRv = 0.34;
    const wallLv = 0.045 * echo.wall; const wallRv = 0.02;
    const aLa = 0.1 * echo.la; const bLa = 0.075 * echo.la; const cxLa = cxLv; const cyLa = cyLv + bLv + 0.04 + bLa;
    const aRa = 0.09; const bRa = 0.07; const cxRa = cxRv; const cyRa = cyRv + bRv + 0.04 + bRa;

    // Pericardium and any fluid.
    const minX = cxRv - aRv - wallRv; const maxX = cxLv + aLv + wallLv;
    const minY = cyLv - bLv - wallLv; const maxY = Math.max(cyLa + bLa, cyRa + bRa) + 0.015;
    const gap = effusionGap(echo);
    const pcx = (minX + maxX) / 2; const pcy = (minY + maxY) / 2;
    ellipsePath(pcx, pcy, ((maxX - minX) / 2) * 1.04 + gap, ((maxY - minY) / 2) * 1.04 + gap * 1.1);
    ctx.strokeStyle = '#e6e6e6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Heart muscle.
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#d2d2d2'); grad.addColorStop(1, '#6e6e6e');
    ctx.fillStyle = grad;
    ellipsePath(cxLv, cyLv, aLv + wallLv, bLv + wallLv, null, 1); ctx.fill();
    ellipsePath(cxRv, cyRv, aRv + wallRv, bRv + wallRv, null, -1); ctx.fill();
    ellipsePath(cxLa, cyLa, aLa + 0.014, bLa + 0.014); ctx.fill();
    ellipsePath(cxRa, cyRa, aRa + 0.014, bRa + 0.014); ctx.fill();

    // Blood pools are black.
    ctx.fillStyle = '#000';
    ellipsePath(cxLv, cyLv, aLv, bLv, (th) => lvRadiusFactor(echo, c, th), 1); ctx.fill();
    ellipsePath(cxRv, cyRv, aRv, bRv, (th) => rvRadiusFactor(echo, c, th), -1); ctx.fill();
    ellipsePath(cxLa, cyLa, aLa, bLa); ctx.fill();
    ellipsePath(cxRa, cyRa, aRa, bRa); ctx.fill();

    // Mitral and tricuspid valves: open in diastole, closed in systole.
    ctx.strokeStyle = '#f4f4f4';
    ctx.lineWidth = 2.5;
    const valve = (cx, cy, a) => {
      const open = 1 - c;
      ctx.beginPath();
      ctx.moveTo((cx - a) * w, (cy) * h); ctx.lineTo((cx - a * 0.2) * w, (cy + 0.03 * open) * h);
      ctx.moveTo((cx + a) * w, (cy) * h); ctx.lineTo((cx + a * 0.2) * w, (cy + 0.03 * open) * h);
      ctx.stroke();
    };
    valve(cxLv, cyLv + bLv + 0.02, aLv * 0.9);
    valve(cxRv, cyRv + bRv + 0.02, aRv * 0.9);

    // Mitral regurgitation: a mosaic jet in the left atrium during systole.
    if (echo.mr && c > 0.15) {
      const jx = cxLa; const jy = cyLv + bLv + 0.03;
      for (let i = 0; i < 70; i++) {
        const t = Math.random();
        const x = jx + (Math.random() - 0.5) * 0.07 * (0.4 + t);
        const y = jy + t * 0.1;
        ctx.fillStyle = ['#ff7a1a', '#2f6bff', '#2fd16b', '#ffe14a'][Math.floor(Math.random() * 4)];
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x * w, y * h, 3, 3);
      }
      ctx.globalAlpha = 1;
    }

    // Speckle and depth fade.
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.55;
    const pat = ctx.createPattern(noise, 'repeat');
    ctx.save();
    ctx.translate(Math.random() * 160, Math.random() * 160);
    ctx.fillStyle = pat;
    ctx.fillRect(-160, -160, w + 320, h + 320);
    ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const fade = ctx.createLinearGradient(0, h * 0.5, 0, h);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Sector edge and depth marks.
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(apexX, apexY);
    ctx.arc(apexX, apexY, R, Math.PI / 2 - half, Math.PI / 2 + half);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 1; i <= 6; i++) ctx.fillRect(w - 14, h * (0.02 + i * 0.15), 8, 1.5);
  }

  function frame(now) {
    const { echo, hr, rhythm, frozen } = getState();
    if (!frozen) {
      if (cycleStart == null) cycleStart = now;
      if (now - cycleStart >= cycleLen * 1000) {
        cycleStart = now;
        const base = 60 / Math.max(30, Math.min(200, hr));
        cycleLen = rhythm === 'afib' ? base * (0.6 + 0.8 * Math.random()) : base;
      }
      frozenC = contraction(Math.min(0.999, (now - cycleStart) / (cycleLen * 1000)));
    }
    draw(echo, frozenC, now);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return { stop() { cancelAnimationFrame(raf); ro?.disconnect(); } };
}
