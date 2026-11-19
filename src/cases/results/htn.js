// Hypertensive emergency: findings follow the blood pressure, the first IV drug, the diuretic, and a drop that is too fast.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const high = (s) => s.vitals.sbp > 215;
const overshoot = (s) => s.flags.overshootAt != null && s.t - s.flags.overshootAt < 30;
const treated = (s) => !!s.flags.agent && !overshoot(s);

export const exam = {
  inspect: (s) => (overshoot(s) ? 'Drowsy, cold and pale after the pressure fell too fast.'
    : s.severity <= 0.3 ? 'Calmer. The headache is easing and he is alert.'
      : s.severity > 0.7 ? 'Drowsy and confused, sweaty, with a severe headache. He does not follow commands reliably.'
        : treated(s) ? 'Still restless, but the headache is starting to ease as the pressure falls.'
          : 'Anxious and restless with a severe headache, a little confused, sweaty. No facial droop and he moves all four limbs.'),
  heartSounds: (s) => (high(s) ? 'Fast, regular. A loud second heart sound and a fourth heart sound. No murmur.'
    : `Regular at about ${hr(s)}/min. The second heart sound is softer as the pressure falls, and the fourth heart sound is still there.`),
  lungs: (s) => (s.severity <= 0.4 ? 'Clear on both sides.'
    : s.flags.furosemide ? 'The crackles are fewer and confined to the lowest part of both bases.'
      : 'Fine crackles at both bases.'),
  jvp: () => 'Neck veins are not raised.',
  pulses: (s) => (overshoot(s) ? 'Thin, weak pulses and cool hands after the pressure fell too fast.'
    : high(s) ? 'Strong, bounding pulses, equal in both arms and both legs.'
      : 'Strong, regular pulses, equal in both arms and both legs. Less bounding than before.'),
};

export const tests = {
  ecg12: (s) => `Sinus rhythm ${hr(s)}/min. Left ventricular hypertrophy with a strain pattern.`,
  troponin: () => 'Troponin I 0.09 ng/mL (normal below 0.04), a small leak from the strained heart.',
  bnp: () => 'BNP 380 pg/mL, raised.',
  bmp: (s) => (overshoot(s) ? 'Potassium 3.9, sodium 140, creatinine 2.5 mg/dL. The kidneys are worse after the pressure fell too fast.'
    : s.flags.agent && s.severity <= 0.4 ? 'Potassium 3.9, sodium 140, creatinine 1.9 mg/dL. The kidneys are recovering as the pressure comes down.'
      : 'Potassium 3.9, sodium 140, creatinine 2.1 mg/dL. The kidneys are injured.'),
  cxr: (s) => (s.flags.furosemide || s.severity <= 0.3 ? 'Mild cardiomegaly. The pulmonary edema is clearing. The aortic outline is normal.'
    : 'Mild cardiomegaly and early pulmonary edema. The aortic outline is normal.'),
};

export const auscultation = {
  heart: {
    aortic: (s) => (high(s) ? 'A loud second heart sound at the aortic area. No murmur.' : 'The second heart sound is softer at the aortic area as the pressure falls. No murmur.'),
    pulmonic: () => 'Normal sounds. No murmur.',
    tricuspid: () => 'Normal sounds. No murmur.',
    mitral: () => 'A fourth heart sound at the apex. No murmur.',
  },
  lungs: {
    upper: () => 'Clear in the upper zones.',
    lower: (s) => (s.severity <= 0.4 ? 'Clear at the bases.' : s.flags.furosemide ? 'Fine crackles at the lowest part of both bases only.' : 'Fine crackles at both bases.'),
  },
};

const CHRONIC = 'This comes from ten years of high blood pressure and does not change in minutes.';
export const unchanged = {
  'exam.jvp': 'The neck veins are never raised in this case: the problem is pressure, not fluid overload of the right heart.',
  'test.ecg12': `The left ventricular hypertrophy and strain pattern persist: ${CHRONIC}`,
  'test.troponin': 'The small troponin leak is from the strained heart and does not change in minutes.',
  'test.bnp': 'BNP is raised from the strained heart and falls over days, not minutes.',
  'test.echo': `The thickened heart muscle persists: ${CHRONIC}`,
  'site.heart.pulmonic': 'Nothing is heard at the pulmonic area in any state of this case.',
  'site.heart.tricuspid': 'Nothing is heard at the lower left sternal edge in any state of this case.',
  'site.heart.mitral': `The fourth heart sound persists: ${CHRONIC}`,
  'site.lungs.upper': 'The upper lungs stay clear in every state of this case: the fluid sits at the bases.',
};
