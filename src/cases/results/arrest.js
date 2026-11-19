// Cardiac arrest: compressions, oxygen, a shock and the return of a pulse each change what the learner finds.
const r = Math.round;
const hr = (s) => r(s.vitals.hr);
const rosc = (s) => !!s.flags.rosc;
const cpr = (s) => !!s.flags.cpr && !s.flags.rosc;
const bag = (s) => !!s.flags.oxygen && !s.flags.rosc;

export const exam = {
  inspect: (s) => (rosc(s) ? 'Pale and clammy, breathing with assistance. The pupils react to light.'
    : cpr(s) ? 'Unresponsive and pale, with the chest moving under the compressions. The pupils are wide and fixed.'
      : 'Unresponsive, pale and not breathing normally. The pupils are wide.'),
  heartSounds: (s) => (rosc(s) ? `Fast and regular at about ${hr(s)}/min.`
    : cpr(s) ? 'No spontaneous heart sounds. Only the sound of the compressions.'
      : 'No heart sounds are heard.'),
  lungs: (s) => (rosc(s) ? 'Air entry on both sides with assisted breaths.'
    : bag(s) ? 'The chest rises with each bag-mask breath. No spontaneous breathing.'
      : 'No breathing. No breath sounds.'),
  jvp: (s) => (rosc(s) ? 'Not raised.' : cpr(s) ? 'Not assessable. The neck veins pulse with each compression.' : 'Not assessable.'),
  pulses: (s) => (rosc(s) ? 'Weak but present carotid and femoral pulses.'
    : cpr(s) ? 'No spontaneous pulse. A femoral pulse is felt with each compression, so the compressions are working.'
      : 'No carotid or femoral pulse.'),
};

export const tests = {
  ecg12: (s) => (rosc(s) ? `Sinus tachycardia ${hr(s)}/min with ST elevation in V1 to V4. Anterior STEMI.`
    : cpr(s) ? 'Ventricular fibrillation with compression artifact. No organized electrical activity.'
      : 'Ventricular fibrillation. No organized electrical activity.'),
  troponin: (s) => (rosc(s) ? 'Troponin I 0.9 ng/mL (normal below 0.04) and rising: a heart attack is the likely cause.' : 'Troponin I 0.3 ng/mL (normal below 0.04), already rising.'),
  bnp: (s) => (rosc(s) ? 'BNP 180 pg/mL, raised after the arrest.' : 'BNP 120 pg/mL.'),
  bmp: (s) => (rosc(s) ? 'Potassium 4.1, bicarbonate 17 (improving), creatinine 1.1 mg/dL. Lactate 7 mmol/L, falling.'
    : 'Potassium 4.0, bicarbonate 14 (low), creatinine 1.1 mg/dL. Lactate 9 mmol/L (very high).'),
  cxr: (s) => (s.given.cpr ? 'Normal heart size. Clear lungs. A fractured rib on the left from the compressions.' : 'Normal heart size. Clear lungs.'),
};

const heartAt = (where) => (s) => (rosc(s) ? `Fast and regular at the ${where}. No murmur.`
  : cpr(s) ? 'Only compression noise. No spontaneous heart sounds.'
    : 'No heart sounds are heard.');
const lungsAt = (s) => (rosc(s) ? 'Air entry on both sides with assisted breaths.'
  : bag(s) ? 'Breath sounds are heard only with each bag-mask breath.'
    : 'No breath sounds.');
export const auscultation = {
  heart: { aortic: heartAt('aortic area'), pulmonic: heartAt('pulmonic area'), tricuspid: heartAt('lower left sternal edge'), mitral: heartAt('apex') },
  lungs: { upper: lungsAt, lower: lungsAt },
};

export const unchanged = {};
