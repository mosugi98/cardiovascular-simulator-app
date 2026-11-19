// What the examinations, tests and listening sites show for the anterior STEMI, at each stage of the case.
// Every result reads the patient's current state: what has been given, the vital signs, and the time.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const rep = (s) => !!s.flags.reperfused;
const fluids = (s) => (s.given.fluids ?? 0) > 0;
const worse = (s) => s.severity > 0.7;

export const exam = {
  inspect: (s) => (rep(s) ? 'Comfortable, pain-free, no longer sweating. He is talking easily.'
    : worse(s) ? 'Grey, drenched in sweat, drowsy and in severe distress.'
      : s.flags.nitroAt != null ? 'Still pale and sweaty, but less restless. The pain has eased a little since the nitroglycerin.'
        : 'Anxious, pale and sweaty, clutching his chest.'),
  heartSounds: (s) => (worse(s) ? `Fast at about ${hr(s)}/min. A third heart sound (gallop) has appeared on top of the fourth sound.`
    : rep(s) ? `Regular at about ${hr(s)}/min. The fourth sound is fainter and there is no murmur.`
      : `Regular rhythm at about ${hr(s)}/min. Normal first and second sounds, a soft fourth sound, no murmur.`),
  lungs: (s) => (worse(s) ? 'Crackles at both lung bases.' : fluids(s) ? 'Fine crackles at both bases after the fluid bolus.' : 'Clear on both sides.'),
  jvp: (s) => (worse(s) || fluids(s) ? 'Neck veins are raised, about 8 cm.' : 'Neck veins are not raised.'),
  pulses: (s) => (worse(s) ? 'Weak, fast pulses. Cold, clammy hands and feet.'
    : rep(s) ? 'Strong, regular pulses. Warm hands and feet.'
      : s.flags.nitroAt != null ? 'Pulses strong and equal. His blood pressure is lower since the nitroglycerin.'
        : 'Pulses strong and equal in both arms. Warm hands.'),
};

export const tests = {
  ecg12: (s) => (rep(s)
    ? `Sinus rhythm ${hr(s)}/min. ST elevation in V1 to V4 is falling, with new T wave inversion. Reperfusion pattern.`
    : s.t >= 30
      ? `Sinus rhythm ${hr(s)}/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Q waves are starting to form in V1 to V3. Anterior STEMI.`
      : `Sinus rhythm ${hr(s)}/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Anterior STEMI.`),
  troponin: (s) => (rep(s)
    ? `Troponin I ${(1.4 + 0.1 * Math.max(0, s.t - s.flags.pciAt)).toFixed(1)} ng/mL (normal below 0.04). Still rising after reperfusion, and it should peak within hours.`
    : `Troponin I ${(0.12 + 0.05 * s.t).toFixed(2)} ng/mL (normal below 0.04), rising with the time since the pain began.`),
  bnp: (s) => (worse(s) ? 'BNP 640 pg/mL, rising: the left ventricle is struggling.'
    : fluids(s) ? 'BNP 420 pg/mL, higher after the fluid bolus.'
      : rep(s) ? 'BNP 230 pg/mL, mildly raised. It falls over days, not minutes.'
        : 'BNP 210 pg/mL, mildly raised.'),
  bmp: (s) => (worse(s) ? 'Potassium 4.4, bicarbonate 19 (low), creatinine 1.3 mg/dL. Lactate 3.1 mmol/L (raised).'
    : rep(s) ? 'Potassium 4.0, sodium 139, creatinine 1.0 mg/dL. Creatinine will be repeated in 24 hours because of the contrast dye.'
      : 'Potassium 4.1, sodium 139, creatinine 1.0 mg/dL, glucose 128 mg/dL.'),
  cxr: (s) => (worse(s) ? 'Normal heart size. Pulmonary edema is developing.'
    : fluids(s) ? 'Normal heart size. Early vascular congestion after the fluid bolus.'
      : 'Normal heart size. Clear lung fields.'),
  // The echo result is the live echo caption, supplied by the case.
};

export const auscultation = {
  heart: {
    aortic: () => 'Normal first and second sounds. No murmur at the aortic area.',
    pulmonic: () => 'Normal first and second sounds. No murmur at the pulmonic area.',
    tricuspid: () => 'Normal sounds. No murmur at the lower left sternal edge.',
    mitral: (s) => (worse(s) ? 'A third heart sound and a new holosystolic murmur at the apex: the papillary muscle is ischemic.'
      : rep(s) ? 'At the apex there is a faint fourth sound. No murmur.'
        : 'At the apex there is a soft fourth sound. No murmur.'),
  },
  lungs: {
    upper: (s) => (worse(s) || fluids(s) ? 'Fine crackles are heard in the upper zones.' : 'Clear in the upper zones.'),
    lower: (s) => (worse(s) || fluids(s) ? 'Crackles at the bases.' : 'Clear at the bases.'),
  },
};

const CLEAR = 'The lungs are clear at the start and stay clear when he is treated correctly. They change only if fluid harms him or he gets much worse.';
export const unchanged = {
  'exam.lungs': CLEAR,
  'exam.jvp': 'The neck veins are not raised at the start and stay flat when he is treated correctly. They rise only if fluid harms him or he gets much worse.',
  'test.cxr': 'The chest X-ray is clear at the start and after correct treatment. It shows congestion only if fluid harms him or he gets much worse.',
  'site.heart.aortic': 'Nothing is heard at the aortic area in any state of this case: the murmur of a ruptured papillary muscle is heard at the apex.',
  'site.heart.pulmonic': 'Nothing is heard at the pulmonic area in any state of this case: the abnormal sounds are heard at the apex.',
  'site.heart.tricuspid': 'Nothing is heard at the lower left sternal edge in any state of this case: the abnormal sounds are heard at the apex.',
  'site.lungs.upper': CLEAR,
  'site.lungs.lower': CLEAR,
};
