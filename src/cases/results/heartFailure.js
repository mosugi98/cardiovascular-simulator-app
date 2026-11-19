// Acute decompensated heart failure: findings follow the fluid, the oxygen and the diuretic.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const better = (s) => s.severity <= 0.3; // largely recovered
const diuresing = (s) => !!s.flags.furosemide && s.severity > 0.3;
const bipap = (s) => !!s.flags.niv && s.severity > 0.3;
const fluidGiven = (s) => (s.given.fluids ?? 0) > 0;

const dire = (s) => s.severity > 0.7;

export const exam = {
  inspect: (s) => (better(s) ? 'Sitting up, breathing comfortably and speaking in full sentences.'
    : dire(s) ? 'Exhausted and gasping, drowsy, with blue lips and pink frothy sputum.'
      : fluidGiven(s) ? 'Gasping and using every neck muscle, with pink frothy sputum. The fluid has made the pulmonary edema worse.'
      : bipap(s) ? 'On BiPAP, still sitting up but breathing more easily and speaking in short sentences.'
        : s.flags.oxygen ? 'On oxygen, still using his neck muscles to breathe and speaking in short phrases.'
          : 'Sitting bolt upright, using his neck muscles to breathe and speaking in short phrases.'),
  heartSounds: (s) => (better(s) ? `Regular at about ${hr(s)}/min. The third heart sound is softer and the murmur is quieter.`
    : dire(s) ? `Very fast at about ${hr(s)}/min. A loud gallop and a louder murmur at the apex.`
      : `Regular and fast at about ${hr(s)}/min. A third heart sound (gallop) and a soft murmur at the apex.`),
  lungs: (s) => (better(s) ? 'Fine crackles at the bases only.'
    : s.severity > 0.7 ? 'Crackles to the top of both lungs, with wheeze.'
      : diuresing(s) ? 'The crackles are retreating: now heard in the lower two thirds of both lungs.'
        : bipap(s) ? 'Crackles in the mid-zones of both lungs, with better air entry on BiPAP.'
          : 'Crackles up to the middle of both lungs. No wheeze.'),
  jvp: (s) => (better(s) ? 'Neck veins are only slightly raised, about 6 cm.'
    : dire(s) ? 'Neck veins are very full, about 15 cm, and visibly pulsating.'
      : diuresing(s) ? 'Neck veins are lower, about 9 cm, and pressing on the liver raises them less.'
      : 'Neck veins are raised, about 12 cm, and pressing on the liver raises them further.'),
  pulses: (s) => (better(s) ? 'Warm hands and feet. The swelling has gone down to the ankles.'
    : dire(s) ? 'Fast, thready pulses. The hands and feet are cool now. Pitting swelling up to both knees.'
      : diuresing(s) ? 'Warm hands and feet. The swelling is a little less, pitting up to the shins.'
      : 'Warm hands and feet. Pitting swelling up to both knees.'),
};

export const tests = {
  ecg12: (s) => `Sinus ${hr(s) > 100 ? 'tachycardia' : 'rhythm'} ${hr(s)}/min with an old left bundle branch block. No new ST elevation.`,
  troponin: () => 'Troponin I 0.06 ng/mL, mildly raised, in a pattern of long-standing heart strain.',
  bnp: (s) => (s.flags.furosemide ? 'BNP 1,850 pg/mL, still markedly raised. It falls over days, not minutes.'
    : dire(s) ? 'BNP 2,600 pg/mL, rising.'
      : 'BNP 1,850 pg/mL, markedly raised.'),
  bmp: (s) => (s.flags.furosemide
    ? 'Potassium 3.9 (falling after the diuretic), sodium 134, creatinine 1.7 mg/dL (his usual is 1.4).'
    : 'Potassium 4.8, sodium 133, creatinine 1.6 mg/dL (his usual is 1.4).'),
  cxr: (s) => (better(s) ? 'Enlarged heart. Pulmonary edema is clearing.'
    : dire(s) ? 'Enlarged heart with florid pulmonary edema: both lungs are white, in a bat-wing pattern.'
      : fluidGiven(s) ? 'Enlarged heart with worse pulmonary edema: new haziness since the fluid bolus.'
      : diuresing(s) ? 'Enlarged heart. The edema is still present but the haziness is lessening.'
        : 'Enlarged heart, haziness around both lung hila and Kerley B lines: pulmonary edema.'),
};

const quiet = (s) => `${hr(s) > 100 ? 'Fast and regular' : 'Regular'}. Nothing abnormal is heard at this site.`;
export const auscultation = {
  heart: {
    aortic: quiet,
    pulmonic: quiet,
    tricuspid: quiet,
    mitral: (s) => (better(s) ? 'A softer third heart sound and a quieter murmur at the apex.'
      : 'A third heart sound (gallop) and a soft holosystolic murmur at the apex.'),
  },
  lungs: {
    upper: (s) => (better(s) ? 'Clear in the upper zones.' : diuresing(s) ? 'The crackles in the upper zones have mostly cleared.' : 'Crackles reach the upper zones.'),
    lower: (s) => (better(s) ? 'Fine crackles at the bases only.' : diuresing(s) ? 'Coarse crackles at the bases, fewer than before.' : 'Coarse crackles at both bases.'),
  },
};

export const unchanged = {
  'test.troponin': 'The troponin leak is long-standing heart strain, not a new injury, so it does not change as the lungs clear.',
};
