// Stable supraventricular tachycardia: the rhythm findings change when it is converted. Structure and blood tests do not.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const sinus = (s) => !!s.flags.sinus;
const tried = (s) => !!s.flags.vagal && !s.flags.sinus;

export const exam = {
  inspect: (s) => (sinus(s) ? 'Calm and comfortable.'
    : tried(s) ? 'Anxious but comfortable. The vagal maneuver slowed her heart for a moment, then it raced again.'
      : 'Anxious but comfortable, a little pale, talking in full sentences.'),
  heartSounds: (s) => (sinus(s) ? `Regular at about ${hr(s)}/min. Normal sounds.` : `Very fast and perfectly regular, about ${hr(s)}/min. Normal sounds, no murmur.`),
  lungs: () => 'Clear on both sides.',
  jvp: (s) => (sinus(s) ? 'Not raised.' : 'Not raised. Rapid regular pulsations are visible in the neck.'),
  pulses: (s) => (sinus(s) ? 'Regular pulse, equal in both arms.'
    : tried(s) ? 'Fast, regular and thready. It slowed for a few beats during the vagal maneuver, then raced again.'
      : 'Fast, regular, thready radial pulse, too fast to count exactly. Warm hands.'),
};

export const tests = {
  ecg12: (s) => (sinus(s) ? `Sinus rhythm ${hr(s)}/min. Normal. No delta wave.`
    : `Regular narrow-complex tachycardia at ${hr(s)}/min with no visible P waves and mild ST depression. Supraventricular tachycardia.`),
  troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
  bnp: () => 'BNP 40 pg/mL, normal.',
  bmp: () => 'Potassium 4.1, magnesium 2.0, creatinine 0.8 mg/dL.',
  cxr: () => 'Normal heart size. Clear lung fields.',
};

const heartAt = (where) => (s) => (sinus(s) ? `Regular. Normal sounds at the ${where}.` : `Very fast and regular. No murmur at the ${where}.`);
export const auscultation = {
  heart: {
    aortic: heartAt('aortic area'),
    pulmonic: heartAt('pulmonic area'),
    tricuspid: heartAt('lower left sternal edge'),
    mitral: (s) => (sinus(s) ? 'Regular. Normal sounds at the apex.' : 'Very fast and regular, too fast to separate the heart sounds. No murmur.'),
  },
  lungs: { upper: () => 'Clear in the upper zones.', lower: () => 'Clear at the bases.' },
};

const NORMAL = 'This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle.';
export const unchanged = {
  'exam.lungs': NORMAL,
  'test.troponin': NORMAL,
  'test.bnp': NORMAL,
  'test.bmp': 'Nothing the learner can give changes the electrolytes, and they were normal to begin with.',
  'test.cxr': NORMAL,
  'test.echo': 'The heart is structurally normal, and its structure does not change in minutes. Only the rhythm changes.',
  'site.lungs.upper': NORMAL,
  'site.lungs.lower': NORMAL,
};
