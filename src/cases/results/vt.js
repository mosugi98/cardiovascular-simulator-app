// Unstable ventricular tachycardia: the shock changes the rhythm findings at once, and the tachycardia can come back.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const sinus = (s) => !!s.flags.sinus;
const back = (s) => !!s.flags.recurred && !s.flags.sinus;

export const exam = {
  inspect: (s) => (sinus(s) ? (s.flags.amiodarone ? 'Calmer, color returning, no longer sweating. An amiodarone infusion is running.' : 'Calmer, color returning, no longer sweating.')
    : back(s) ? 'Pale, sweaty and drowsy again, clutching his chest. The tachycardia has come back.'
      : 'Pale, sweaty and drowsy, clutching his chest.'),
  heartSounds: (s) => (sinus(s) ? `Regular at about ${hr(s)}/min.` : 'Very fast and regular. The first heart sound varies in loudness.'),
  lungs: () => 'Clear on both sides.',
  jvp: (s) => (sinus(s) ? 'Not raised.' : 'Neck veins show occasional large pulsations (cannon waves).'),
  pulses: (s) => (sinus(s) ? 'Regular pulse. Warm hands.' : 'Fast, weak pulse. Cool hands.'),
};

export const tests = {
  ecg12: (s) => (sinus(s) ? 'Sinus rhythm with old anterior Q waves.'
    : `Regular wide-complex tachycardia at ${hr(s)}/min, no P waves, QRS about 160 ms. Ventricular tachycardia.`),
  troponin: () => 'Troponin I 0.08 ng/mL (normal below 0.04), mildly raised.',
  bnp: () => 'BNP 540 pg/mL, raised.',
  bmp: () => 'Potassium 3.4 (low), magnesium 1.5 (low), creatinine 1.2 mg/dL.',
  cxr: () => 'Mild cardiomegaly. Clear lung fields.',
};

const heartAt = (s) => (sinus(s) ? 'Regular. No murmur.' : 'Very fast and regular. No murmur.');
export const auscultation = {
  heart: {
    aortic: heartAt,
    pulmonic: heartAt,
    tricuspid: (s) => (sinus(s) ? 'Regular. No murmur.' : 'Very fast and regular. The first sound varies in loudness from beat to beat.'),
    mitral: (s) => (sinus(s) ? 'Regular. A soft third heart sound.' : 'Very fast and regular. The first sound varies in loudness from beat to beat.'),
  },
  lungs: { upper: () => 'Clear in the upper zones.', lower: () => 'Clear at the bases.' },
};

const OLD = 'This reflects his old heart attack and scar, which a shock and a drug do not change in minutes.';
export const unchanged = {
  'exam.lungs': 'The lungs are clear throughout: this is a rhythm problem, and the rhythm does not flood the lungs in minutes.',
  'test.troponin': `${OLD} The small troponin leak is from the old scar.`,
  'test.bnp': `${OLD} BNP falls over days, not minutes.`,
  'test.bmp': 'Nothing the learner can give replaces potassium or magnesium, so they stay low, and low levels are part of why the tachycardia returns.',
  'test.cxr': 'The chest X-ray is mildly abnormal from the old heart attack and does not change in minutes.',
  'test.echo': OLD,
  'site.lungs.upper': 'The lungs are clear throughout: this is a rhythm problem, not a lung problem.',
  'site.lungs.lower': 'The lungs are clear throughout: this is a rhythm problem, not a lung problem.',
};
