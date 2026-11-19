// Cardiac tamponade: every finding changes once the fluid is drained, and the fluid bolus buys a little time.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const drained = (s) => !!s.flags.drained;
const bolus = (s) => (s.given.fluids ?? 0) > 0 && !s.flags.drained;

const dire = (s) => !s.flags.drained && s.severity > 0.6;

export const exam = {
  inspect: (s) => (drained(s) ? 'Calmer, color returning, breathing easier.'
    : dire(s) ? 'Grey, drenched in sweat and drowsy, barely able to talk. He is breathing fast and shallowly.'
      : bolus(s) ? 'Pale, sweaty and anxious, but a little less drowsy since the fluid bolus.'
      : 'Pale, sweaty and anxious, sitting upright and breathing fast.'),
  heartSounds: (s) => (drained(s) ? `Regular, normal heart sounds at about ${hr(s)}/min.` : `Distant, muffled heart sounds, fast at about ${hr(s)}/min.`),
  lungs: (s) => (drained(s) ? 'Clear on both sides, with deeper breaths now.' : 'Clear on both sides, but the breaths are fast and shallow.'),
  jvp: (s) => (drained(s) ? 'Neck veins are back to a normal height.' : 'Neck veins are markedly raised, about 14 cm, and do not fall when he breathes in.'),
  pulses: (s) => (drained(s) ? 'Strong, regular pulses.'
    : dire(s) ? 'The pulses are barely palpable, very fast and thready. The pulse disappears altogether when he breathes in.'
      : bolus(s) ? 'Fast, thin pulses, a little fuller since the fluid bolus. The systolic pressure still falls about 15 mmHg when he breathes in.'
      : 'Fast, thin pulses. The systolic pressure falls by about 15 mmHg when he breathes in (pulsus paradoxus).'),
};

export const tests = {
  ecg12: (s) => (drained(s)
    ? `Sinus rhythm ${hr(s)}/min. Normal voltage. Diffuse mild ST elevation with PR depression (pericarditis).`
    : dire(s) ? `Sinus tachycardia ${hr(s)}/min. Very low voltage QRS complexes with marked electrical alternans.`
      : `Sinus tachycardia ${hr(s)}/min. Low voltage QRS complexes with electrical alternans (the QRS height alternates beat to beat).`),
  troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
  bnp: () => 'BNP 80 pg/mL, normal.',
  bmp: (s) => (drained(s) ? 'Potassium 4.2, creatinine 1.1 mg/dL, improving as the circulation recovers.'
    : dire(s) ? 'Potassium 5.0, bicarbonate 16 (low), creatinine 1.9 mg/dL (rising). The organs are starved of blood.'
      : 'Potassium 4.4, creatinine 1.3 mg/dL, slightly high from poor perfusion.'),
  cxr: (s) => (drained(s) ? 'The heart outline is smaller after drainage. Clear lung fields.' : 'Enlarged, globe-shaped heart outline. Clear lung fields.'),
};

const heartAt = (where) => (s) => (drained(s)
  ? `Normal heart sounds, heard clearly at the ${where}.`
  : `Distant, muffled heart sounds, even at the ${where}.`);

export const auscultation = {
  heart: {
    aortic: heartAt('aortic area'),
    pulmonic: heartAt('pulmonic area'),
    tricuspid: (s) => (drained(s) ? 'Normal heart sounds. The pericardial rub of pericarditis is heard at the lower left sternal edge.' : 'Distant, muffled heart sounds. No rub is heard.'),
    mitral: (s) => (drained(s) ? 'Normal heart sounds, regular at the apex. No murmur.' : 'Distant, muffled heart sounds, fast. No murmur.'),
  },
  lungs: {
    upper: (s) => (drained(s) ? 'Clear in the upper zones, with good air entry.' : 'Clear in the upper zones, but the breath sounds are quiet.'),
    lower: (s) => (drained(s) ? 'Clear at the bases, with good air entry.' : 'Clear at the bases. Breath sounds are quiet because he is breathing shallowly.'),
  },
};

export const unchanged = {
  'test.troponin': 'Troponin is normal at the start and after drainage: the heart muscle is not injured, the fluid around it is the problem.',
  'test.bnp': 'BNP is normal at the start and stays normal: the heart is not failing, it is being squeezed from outside.',
};
