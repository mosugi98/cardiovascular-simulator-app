import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';

export const P = {
  startSeverity: 0.3,
  growthPerMin: 0.006,
  rateControlRatePerMin: -0.012,
  sinusRatePerMin: -0.02,
  strokeGrowthPerMin: 0.01,
  stableSeverity: 0.2,
  unstableSeverity: 0.7,
  unstableSbp: 90,
  cardioversion: { strokeHarm: 0.3, unstableBenefit: 0.35, anticoagulatedBenefit: 0.1 },
  harm: { secondNodalBlocker: 0.1, pericardiocentesis: 0.1, fluids: 0.05, nitro: 0.05 },
  stableHrBelow: 110,
  hrCap: 190,
  vitals: {
    hrUncontrolled: [105, 140], hrRateControlled: [78, 90], hrSinus: [64, 20],
    sbp: [140, -75], dbp: [88, -50], spo2: [99, -8], rr: [14, 14], temp: [36.7, 0],
  },
};

const harm = (s, amount) => { s.severity = Math.min(1, s.severity + amount); };
const unstable = (s) => s.vitals.sbp < P.unstableSbp;

function rateControlDrug(label, text) {
  return {
    rate: (s) => (s.flags.rateControlled
      ? { rating: 'harmful', why: 'Giving a second AV-nodal blocker on top of the first risks severe slowing of the heart and low blood pressure.', source: SRC.AF }
      : { rating: 'helpful', why: `${label} slows the heart rate. Rate control is first-line for stable AF with a fast rate and preserved heart function.`, source: SRC.AF }),
    apply: (s) => {
      if (s.flags.rateControlled) harm(s, P.harm.secondNodalBlocker);
      s.flags.rateControlled = true;
    },
    text,
  };
}

export default {
  id: 'afib-rvr',
  name: 'Atrial Fibrillation with RVR',
  caseNumber: 201,
  prefix: 'ARR',
  categories: ['Arrhythmia'],
  chiefComplaints: ['Palpitations'],
  unreleased: false,
  patient: '68-year-old woman with 6 hours of a racing, uneven heartbeat and mild light-headedness. She has high blood pressure. She is awake, talking and comfortable at rest.',
  monitorLead: 'II',
  deathRhythm: 'vf',
  params: P,

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    if (f.stroke) return P.strokeGrowthPerMin;
    if (f.sinus) return P.sinusRatePerMin;
    if (f.rateControlled) return P.rateControlRatePerMin;
    return P.growthPerMin;
  },

  events(s) {
    if (s.severity >= P.unstableSeverity && !s.flags.unstableNoted && !s.flags.sinus && !s.flags.rateControlled) {
      s.flags.unstableNoted = true;
      return ['Her blood pressure is falling and she is light-headed and confused. She is now hemodynamically unstable.'];
    }
    return [];
  },

  targets(s) {
    const f = s.flags;
    const hrModel = f.sinus ? P.vitals.hrSinus : f.rateControlled ? P.vitals.hrRateControlled : P.vitals.hrUncontrolled;
    return {
      vitals: {
        hr: Math.min(P.hrCap, lin(hrModel, s.severity)),
        sbp: lin(P.vitals.sbp, s.severity),
        dbp: lin(P.vitals.dbp, s.severity),
        spo2: lin(P.vitals.spo2, s.severity),
        rr: lin(P.vitals.rr, s.severity),
        temp: lin(P.vitals.temp, s.severity),
      },
      rhythm: f.sinus ? 'sinus' : 'afib',
      ecg: { amp: 1 },
    };
  },

  end(s) {
    const f = s.flags;
    if (s.severity >= 1) {
      return { status: 'dead', reason: f.stroke
        ? 'She had a large stroke from a clot released by cardioversion without anticoagulation.'
        : 'The uncontrolled rapid rate caused cardiovascular collapse and cardiac arrest.' };
    }
    if (!f.stroke && (f.sinus || f.rateControlled) && s.severity <= P.stableSeverity && s.vitals.hr < P.stableHrBelow) {
      return { status: 'stabilized', reason: 'Her heart rate is controlled and she is comfortable. She is moving to a monitored bed.' };
    }
    return null;
  },

  treat: {
    diltiazem: rateControlDrug('Diltiazem', 'Diltiazem is given IV. Her heart rate starts to come down.'),
    metoprolol: rateControlDrug('Metoprolol', 'Metoprolol is given IV. Her heart rate starts to come down.'),
    heparin: {
      rating: 'helpful', why: 'Her stroke risk is high (age 65 to 74, female, high blood pressure), so anticoagulation is indicated, especially around any cardioversion.', source: SRC.AF,
      apply: (s) => { s.flags.anticoag = true; }, text: 'Heparin is started.',
    },
    cardioversion: {
      rate: (s) => {
        if (unstable(s)) return { rating: 'helpful', why: 'Synchronized cardioversion is the right treatment when AF causes hemodynamic instability.', source: SRC.AF };
        if (s.flags.anticoag) return { rating: 'neutral', why: 'Not needed now. A stable patient can be treated with rate control first.', source: SRC.AF };
        return { rating: 'harmful', why: 'Cardioversion without anticoagulation risks a stroke from a clot in the atrium. She is stable, so there was no need to take that risk.', source: SRC.AF };
      },
      apply: (s) => {
        const f = s.flags;
        const wasUnstable = unstable(s);
        f.sinus = true;
        if (wasUnstable) {
          s.severity = Math.max(0, s.severity - P.cardioversion.unstableBenefit);
        } else if (f.anticoag) {
          s.severity = Math.max(0, s.severity - P.cardioversion.anticoagulatedBenefit);
        } else {
          f.stroke = true;
          harm(s, P.cardioversion.strokeHarm);
          addEvent(s, 'Her rhythm is back to sinus, but she suddenly cannot move her right arm and cannot speak clearly. This is an embolic stroke.');
        }
      },
      text: 'A synchronized shock is delivered.',
    },
    pericardiocentesis: { rating: 'harmful', why: 'There is no effusion to drain, so the procedure only adds risk.', source: SRC.PERICARDIAL, apply: (s) => { harm(s, P.harm.pericardiocentesis); }, text: 'The needle is placed. No fluid is found.' },
    fluids: { rating: 'harmful', why: 'Fluid does not slow the rate and risks congestion.', source: SRC.AF, apply: (s) => { harm(s, P.harm.fluids); }, text: 'A fluid bolus runs in.' },
    nitro: { rating: 'harmful', why: 'Nitroglycerin has no role here and can lower blood pressure.', source: SRC.AF, apply: (s) => { harm(s, P.harm.nitro); }, text: 'Nitroglycerin is given.' },
    oxygen: { rating: 'neutral', why: 'Her oxygen saturation is normal.', source: SRC.AF, text: 'Oxygen is started.' },
    aspirin: { rating: 'neutral', why: 'Aspirin does not replace anticoagulation for stroke prevention in AF.', source: SRC.AF, text: 'Aspirin is given.' },
  },

  exam: {
    inspect: () => 'Anxious and a little short of breath, but comfortable at rest and speaking in full sentences.',
    heartSounds: (s) => (s.flags.sinus
      ? `Regular rhythm at about ${round(s.vitals.hr)}/min. No murmur.`
      : `Irregularly irregular and fast, about ${round(s.vitals.hr)}/min. No murmur.`),
    lungs: () => 'Clear on both sides.',
    jvp: () => 'Neck veins are not raised.',
    pulses: (s) => (s.flags.sinus
      ? 'Regular pulse, equal in both arms.'
      : 'Irregular pulse. The radial pulse is slower than the heartbeat heard at the chest (pulse deficit).'),
  },

  tests: {
    ecg12: (s) => (s.flags.sinus
      ? `Sinus rhythm ${round(s.vitals.hr)}/min. Narrow QRS. No acute ST changes.`
      : `Irregularly irregular rhythm with no P waves. Ventricular rate ${round(s.vitals.hr)}/min, narrow QRS. Atrial fibrillation with rapid ventricular response.`),
    troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
    bnp: () => 'BNP 140 pg/mL, slightly raised for her age.',
    bmp: () => 'Potassium 3.6, magnesium 1.7 (low-normal), creatinine 0.9 mg/dL.',
    cxr: () => 'Normal heart size. Clear lung fields.',
    echo: () => 'Ejection fraction 55%. Mildly enlarged left atrium. No pericardial effusion. Bedside views cannot rule out a clot in the left atrial appendage.',
  },

  useful: {
    ecg12: { why: 'The ECG confirms atrial fibrillation and excludes other rhythms and ischemia.', source: SRC.AF },
    bmp: { why: 'Low potassium or magnesium can drive arrhythmia, and kidney function guides dosing.', source: SRC.AF },
    echo: { why: 'Knowing heart function (ejection fraction) shows which rate-control drug is safe.', source: SRC.AF },
    pulses: { why: 'Perfusion and a pulse deficit help judge stability.', source: SRC.AF },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 15, deadline: 10, why: 'It confirms the rhythm.', source: SRC.AF },
    { label: 'Start rate control (diltiazem or metoprolol)', ids: ['diltiazem', 'metoprolol'], weight: 30, deadline: 25, why: 'Rate control is first-line for stable AF with a fast rate.', source: SRC.AF },
    { label: 'Start anticoagulation', ids: ['heparin'], weight: 20, deadline: 45, why: 'Her stroke risk is high.', source: SRC.AF },
    { label: 'Check electrolytes and kidney function', ids: ['bmp'], weight: 10, deadline: 30, why: 'Correct low potassium or magnesium.', source: SRC.AF },
    { label: 'Check heart function with an echocardiogram', ids: ['echo'], weight: 15, deadline: 30, why: 'It confirms a rate-control drug is safe.', source: SRC.AF },
    { label: 'Assess perfusion and the pulse', ids: ['pulses'], weight: 10, deadline: 15, why: 'It shows whether she is stable.', source: SRC.AF },
  ],

  sounds: (s) => ({ heart: s.flags.sinus ? 'normal' : 'afib', lungs: 'clear' }),

  rules: [
    'Severity (0 to 1) rises by 0.006 per minute while the rate is uncontrolled.',
    'A first AV-nodal blocker (diltiazem or metoprolol) lowers severity by 0.012 per minute. A second one adds 0.1 to severity.',
    'Cardioversion with unstable blood pressure (systolic below 90) lowers severity by 0.35. With anticoagulation it lowers severity by 0.1. Without anticoagulation in a stable patient it adds 0.3 (embolic stroke), then severity rises by 0.01 per minute.',
    'The patient stabilizes when rate is controlled (or sinus), there is no stroke, severity is 0.2 or less and heart rate is below 110. The patient dies when severity reaches 1.',
    'The patient is flagged unstable when severity reaches 0.7 while the rate is still uncontrolled.',
  ],
};
