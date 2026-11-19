// Cardiogenic shock: findings follow the pressors, the oxygen, any harmful fluid, and the reopened artery.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const rep = (s) => !!s.flags.reperfused;
const pressor = (s) => !!(s.flags.norepi || s.flags.dobutamine);
const fluids = (s) => (s.given.fluids ?? 0) > 0;

export const exam = {
  inspect: (s) => (rep(s) ? 'Pale, but warmer and more alert. Breathing easier.'
    : s.severity > 0.8 ? 'Grey, mottled and barely responding.'
      : fluids(s) ? 'Gasping and even more drowsy since the fluid bolus.'
        : pressor(s) ? 'Still pale and clammy, but warmer at the hands and a little more alert since the pressor.'
          : 'Pale, cold and clammy, drowsy and short of breath. The skin is mottled at the knees.'),
  heartSounds: (s) => (rep(s) ? `Fast and regular at about ${hr(s)}/min. The third heart sound is softer.`
    : s.severity > 0.8 ? `Very fast at about ${hr(s)}/min with extra beats. The gallop and the murmur are louder.`
      : `Fast and regular at about ${hr(s)}/min. A third heart sound (gallop).`),
  lungs: (s) => (rep(s) ? 'Crackles at the bases only.'
    : fluids(s) ? 'Crackles to the top of both lungs after the fluid.'
      : s.flags.niv ? 'Crackles up to the mid-zones, with better air entry on BiPAP.'
        : 'Crackles up to the mid-zones on both sides.'),
  jvp: (s) => (rep(s) ? 'Neck veins are still raised but lower, about 9 cm.' : 'Neck veins are raised, about 12 cm.'),
  pulses: (s) => (s.vitals.sbp < 80 ? 'Pulses are barely palpable and fast. Cold hands and feet. Capillary refill is slow.'
    : rep(s) ? 'The pulses are stronger and the hands are warming up.'
      : 'Weak, thready pulses. Cool hands and feet.'),
};

export const tests = {
  ecg12: (s) => (rep(s)
    ? `Sinus tachycardia ${hr(s)}/min. ST elevation in V1 to V4 is falling, with T wave inversion. Reperfusion pattern.`
    : s.severity > 0.8
      ? `Sinus tachycardia ${hr(s)}/min with frequent ventricular ectopic beats. ST elevation in V1 to V5 with Q waves. Extensive anterior STEMI.`
      : `Sinus tachycardia ${hr(s)}/min. ST elevation in V1 to V5 with Q waves, and reciprocal ST depression inferiorly. Extensive anterior STEMI.`),
  troponin: (s) => (rep(s)
    ? `Troponin I ${(9 + 0.3 * Math.max(0, s.t - s.flags.pciAt)).toFixed(1)} ng/mL (normal below 0.04). It is still rising after reperfusion, as expected.`
    : `Troponin I ${(8.4 + 0.15 * s.t).toFixed(1)} ng/mL (normal below 0.04), markedly raised and rising.`),
  bnp: (s) => (rep(s) ? 'BNP 1,100 pg/mL, still markedly raised. It falls over days.' : 'BNP 1,400 pg/mL, markedly raised.'),
  bmp: (s) => (rep(s) ? 'Potassium 4.4, bicarbonate 21, creatinine 1.8 mg/dL. Lactate 2.6 mmol/L, falling.'
    : s.severity > 0.8 ? 'Potassium 5.3, bicarbonate 12 (very low), creatinine 2.4 mg/dL. Lactate 8.1 mmol/L (very high).'
    : pressor(s) ? 'Potassium 4.6, bicarbonate 18, creatinine 1.9 mg/dL. Lactate 4.4 mmol/L, falling slowly with the pressor.'
      : 'Potassium 4.6, bicarbonate 17 (low), creatinine 1.9 mg/dL (rising). Lactate 5.2 mmol/L (high).'),
  cxr: (s) => (rep(s) ? 'Pulmonary edema is clearing, with a normal-sized heart.'
    : fluids(s) ? 'Worse pulmonary edema with a normal-sized heart, since the fluid bolus.'
      : 'Pulmonary edema with a normal-sized heart.'),
};

const quiet = (s) => (rep(s) ? 'Regular, a little fast. Nothing abnormal at this site.' : 'Fast and regular. Nothing abnormal at this site.');
export const auscultation = {
  heart: {
    aortic: quiet,
    pulmonic: quiet,
    tricuspid: quiet,
    mitral: (s) => (rep(s) ? 'A softer third heart sound and a quieter murmur at the apex.'
      : 'A third heart sound (gallop) and a holosystolic murmur at the apex from mitral regurgitation.'),
  },
  lungs: {
    upper: (s) => (rep(s) ? 'Crackles at the edges of the upper zones.' : fluids(s) ? 'Crackles to the very top of the upper zones.' : 'Crackles reach the upper zones.'),
    lower: (s) => (rep(s) ? 'Crackles at the bases only.' : 'Coarse crackles at both bases.'),
  },
};

export const unchanged = {};
