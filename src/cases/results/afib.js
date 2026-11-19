// Atrial fibrillation with a fast rate: what each finding shows as the rate is controlled, converted, or gets worse.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const sinus = (s) => !!s.flags.sinus;
const controlled = (s) => !!s.flags.rateControlled && !s.flags.sinus;
const worse = (s) => s.severity > 0.7;

export const exam = {
  inspect: (s) => (s.flags.stroke ? 'Awake, but with a right facial droop, a weak right arm and slurred speech.'
    : sinus(s) ? 'Calm and comfortable. She says her heart feels normal again.'
      : controlled(s) ? 'Calmer, with the racing eased. She is comfortable at rest.'
        : worse(s) ? 'Pale, sweaty and drowsy. She is short of breath and cannot finish a sentence.'
          : 'Anxious and a little short of breath, but comfortable at rest and speaking in full sentences.'),
  heartSounds: (s) => (sinus(s) ? `Regular rhythm at about ${hr(s)}/min. No murmur.`
    : controlled(s) ? `Still irregularly irregular, but slower, about ${hr(s)}/min. No murmur.`
      : `Irregularly irregular and fast, about ${hr(s)}/min. No murmur.`),
  lungs: (s) => (worse(s) ? 'Fine crackles at both bases from the strain of the fast rate.' : 'Clear on both sides.'),
  jvp: (s) => (worse(s) ? 'Neck veins are mildly raised.' : 'Neck veins are not raised.'),
  pulses: (s) => (sinus(s) ? 'Regular pulse, equal in both arms.'
    : controlled(s) ? 'Irregular, but slower. The pulse deficit is smaller.'
      : 'Irregular pulse. The radial pulse is slower than the heartbeat heard at the chest (pulse deficit).'),
};

export const tests = {
  ecg12: (s) => (sinus(s) ? `Sinus rhythm ${hr(s)}/min. Narrow QRS. No acute ST changes.`
    : controlled(s) ? `Atrial fibrillation with a controlled ventricular rate of ${hr(s)}/min. Narrow QRS.`
      : `Irregularly irregular rhythm with no P waves. Ventricular rate ${hr(s)}/min, narrow QRS. Atrial fibrillation with rapid ventricular response.`),
  troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
  bnp: (s) => (worse(s) ? 'BNP 420 pg/mL, raised by the strain of the fast rate.' : 'BNP 140 pg/mL, slightly raised for her age.'),
  bmp: () => 'Potassium 3.6, magnesium 1.7 (low-normal), creatinine 0.9 mg/dL.',
  cxr: (s) => (worse(s) ? 'Normal heart size. Early congestion at the lung bases.' : 'Normal heart size. Clear lung fields.'),
};

const pattern = (where) => (s) => (sinus(s) ? `Regular. No murmur at the ${where}.`
  : controlled(s) ? `Irregular, but slower. No murmur at the ${where}.`
    : `Fast and irregular. No murmur at the ${where}.`);

export const auscultation = {
  heart: {
    aortic: pattern('aortic area'),
    pulmonic: pattern('pulmonic area'),
    tricuspid: pattern('lower left sternal edge'),
    mitral: (s) => (sinus(s) ? 'Regular rhythm. No murmur at the apex.'
      : controlled(s) ? 'Irregularly irregular, but slower, at the apex. The first sound still changes in loudness. No murmur.'
        : 'Irregularly irregular and fast at the apex. The first sound changes in loudness from beat to beat. No murmur.'),
  },
  lungs: {
    upper: (s) => (worse(s) ? 'Fine crackles in the upper zones.' : 'Clear in the upper zones.'),
    lower: (s) => (worse(s) ? 'Crackles at the bases.' : 'Clear at the bases.'),
  },
};

const STAYS = 'This stays the same when she is treated correctly. It changes only if she gets much worse.';
export const unchanged = {
  'exam.lungs': `The lungs are clear at the start and after correct treatment. ${STAYS}`,
  'exam.jvp': `The neck veins are not raised at the start and after correct treatment. ${STAYS}`,
  'test.troponin': 'Troponin is normal at the start and stays normal: this is a rhythm problem, not a heart attack.',
  'test.bnp': 'BNP is only slightly raised and does not move in minutes. It rises only if the fast rate pushes her into heart failure.',
  'test.bmp': 'Nothing the learner can give replaces potassium or magnesium, so the electrolytes stay as they were.',
  'test.cxr': `The chest X-ray is normal at the start and after correct treatment. ${STAYS}`,
  'test.echo': 'The heart muscle and valves are normal and do not change in minutes. Only the rhythm changes.',
  'site.lungs.upper': `The upper lungs are clear at the start and after correct treatment. ${STAYS}`,
  'site.lungs.lower': `The lung bases are clear at the start and after correct treatment. ${STAYS}`,
};
