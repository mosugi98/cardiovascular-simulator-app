import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';
import * as R from './results/arrest.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.5,
  growthPerMin: 0.045,
  cprFactor: 0.45,
  epinephrineFactor: 0.8,
  amiodaroneFactor: 0.9,
  oxygenFactor: 0.95,
  roscAtShock: 2,
  roscSeverity: 0.45,
  postRoscRatePerMin: -0.03,
  stableSeverity: 0.2,
  harm: { cardioversion: 0.06, pericardiocentesis: 0.06, afterRosc: 0.06 },
  vitalsArrest: { hr: [0, 0], sbp: [0, 0], dbp: [0, 0], spo2: [75, -25], rr: [0, 0], temp: [36.4, 0] },
  vitalsRosc: { hr: [95, 60], sbp: [125, -60], dbp: [80, -40], spo2: [99, -12], rr: [14, 10], temp: [36.0, 0] },
};

const harm = (s, a) => { s.severity = Math.min(1, s.severity + a); };

/** A drug or shock that is right before a pulse returns and wrong after. */
const beforeRosc = (label, why, whyAfter, doIt, text) => ({
  rate: (s) => (s.flags.rosc
    ? { rating: 'harmful', why: whyAfter, source: SRC.ARREST }
    : { rating: 'helpful', why, source: SRC.ARREST }),
  apply: (s) => { if (s.flags.rosc) harm(s, P.harm.afterRosc); else doIt(s); },
  text,
});

export default {
  id: 'cardiac-arrest',
  name: 'Cardiac Arrest',
  caseNumber: 601,
  prefix: 'ARS',
  categories: ['Cardiac Arrest'],
  chiefComplaints: ['Collapse', 'No pulse'],
  unreleased: false,
  patient: '61-year-old man who collapsed in a shopping centre. He has no pulse and is not breathing. The monitor shows ventricular fibrillation.',
  monitorLead: 'II',
  deathRhythm: 'asystole',
  params: P,

  triage: { level: 1, label: 'Resuscitation' },
  person: { age: 61, sex: 'man', pose: 'flat', skin: '#C9966F', hair: '#4a4642', bay: 2 },
  look: { sweaty: false, jvp: () => false, edema: false, dyspnea: () => false, unresponsive: (s) => !s.flags.rosc },
  handover: 'Paramedic handover: 61-year-old man who collapsed in a shopping centre about 8 minutes ago. A bystander started chest compressions after 3 minutes. The paramedics found ventricular fibrillation and have not shocked him yet. No pulse, not breathing. A friend says he has had chest pain for two days.',
  speech: (s) => (s.flags.rosc ? 'He groans but does not wake.' : 'He is unresponsive.'),
  history: {
    speaker: 'Paramedic',
    chips: ['collapse', 'complaint', 'prior', 'pmh', 'meds', 'allergies'],
    answers: {
      collapse: 'A bystander saw him drop in the shopping centre about eight minutes ago. Compressions started after three minutes. We have not shocked him yet.',
      complaint: 'Collapsed and unresponsive, no pulse. Ventricular fibrillation on the monitor.',
      onset: 'About eight minutes ago.',
      syncope: 'He was walking and simply dropped.',
      prior: 'His friend says he has had chest pain on and off for two days.',
      pmh: 'His wife says high cholesterol. He has not seen a doctor for years.',
      meds: 'None that his wife knows of.',
      allergies: 'None known.',
      family: 'His father died suddenly at 52.',
      social: 'He smokes about 20 a day.',
      lastmeal: 'He had lunch an hour ago.',
    },
  },
  auscultation: R.auscultation,
  echo: (s) => ({
    ef: s.flags.rosc ? 0.25 : 0.12, lv: 1, la: 1, wall: 1, effusion: 0, rvCollapse: false, mr: false, hypokinesis: 'anterior-apex',
    caption: s.flags.rosc
      ? 'Reduced pumping, ejection fraction about 25%, with an akinetic anterior wall and apex. No pericardial effusion.'
      : 'No organized cardiac contraction: the heart is quivering. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    if (f.rosc) return P.postRoscRatePerMin;
    let r = P.growthPerMin;
    if (f.cpr) r *= P.cprFactor;
    if (f.epinephrine) r *= P.epinephrineFactor;
    if (f.amiodarone) r *= P.amiodaroneFactor;
    if (f.oxygen) r *= P.oxygenFactor;
    return r;
  },

  events: () => [],

  targets(s) {
    const f = s.flags;
    const v = f.rosc ? P.vitalsRosc : P.vitalsArrest;
    return {
      vitals: { hr: lin(v.hr, s.severity), sbp: lin(v.sbp, s.severity), dbp: lin(v.dbp, s.severity), spo2: lin(v.spo2, s.severity), rr: lin(v.rr, s.severity), temp: lin(v.temp, s.severity) },
      rhythm: f.rosc ? 'sinus' : 'vf',
      ecg: { amp: 1, stElev: f.rosc ? 0.2 : 0, pattern: f.rosc ? 'anterior-stemi' : 'normal' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'Resuscitation was not successful. His heart never regained an effective rhythm.' };
    if (s.flags.rosc && s.severity <= P.stableSeverity) return { status: 'stabilized', reason: 'He has a pulse and is stable after the arrest. He is going to the cath lab for his heart attack.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.ARREST, ['adenosine', 'labetalol', 'nicardipine']),
    cpr: beforeRosc('CPR', 'High-quality compressions keep blood moving to the brain and heart until a shock can work.', 'He has a pulse, so compressions are no longer needed and can injure him.',
      (s) => { s.flags.cpr = true; }, 'Compressions start, 100 to 120 a minute.'),
    defib: {
      repeatable: true,
      rate: (s) => (s.flags.rosc
        ? { rating: 'harmful', why: 'He has a pulse, and a shock now could restart a dangerous rhythm.', source: SRC.ARREST }
        : { rating: 'helpful', why: 'Ventricular fibrillation is treated with a shock as soon as possible.', source: SRC.ARREST }),
      apply: (s) => {
        const f = s.flags;
        if (f.rosc) { harm(s, P.harm.afterRosc); return; }
        f.shocks = (f.shocks ?? 0) + 1;
        if (f.shocks >= P.roscAtShock && f.cpr && f.epinephrine) {
          f.rosc = true;
          s.severity = Math.min(s.severity, P.roscSeverity);
          addEvent(s, 'A pulse returns. The rhythm on the monitor is now organized.');
        } else {
          addEvent(s, f.cpr ? 'Shock delivered. The monitor still shows ventricular fibrillation.' : 'Shock delivered. The monitor still shows ventricular fibrillation, and there is no blood flow between shocks.');
        }
      },
      text: 'A shock is delivered.',
    },
    epinephrine: beforeRosc('Epinephrine', 'Epinephrine helps the heart respond to a shock and raises the pressure that feeds the heart during compressions.', 'He has a pulse, and epinephrine now can cause dangerous high blood pressure and arrhythmia.',
      (s) => { s.flags.epinephrine = true; }, 'Epinephrine 1 mg is given IV.'),
    amiodarone: { rating: 'helpful', why: 'Amiodarone is given for ventricular fibrillation that keeps coming back after shocks.', source: SRC.ARREST, apply: (s) => { s.flags.amiodarone = true; }, text: 'Amiodarone 300 mg is given IV.' },
    oxygen: { rating: 'helpful', why: 'Breaths with oxygen go with compressions.', source: SRC.ARREST, apply: (s) => { s.flags.oxygen = true; }, text: 'Oxygen is given with a bag and mask.' },
    cardioversion: { rating: 'harmful', why: 'A synchronized shock cannot find an R wave in fibrillation, so it does not deliver. Time is lost.', source: SRC.ARREST, apply: (s) => { harm(s, P.harm.cardioversion); }, text: 'The defibrillator is in synchronized mode and does not deliver the shock. Time is lost.' },
    pericardiocentesis: { rating: 'harmful', why: 'There is no sign of an effusion, and stopping compressions for a procedure costs time.', source: SRC.ARREST, apply: (s) => { harm(s, P.harm.pericardiocentesis); }, text: 'The needle is placed. No fluid is found.' },
  },

  exam: R.exam,
  tests: R.tests,
  unchanged: R.unchanged,

  useful: {},

  key: [
    { label: 'Start chest compressions', ids: ['cpr'], weight: 30, deadline: 2, why: 'Compressions must start at once.', source: SRC.ARREST },
    { label: 'Defibrillate', ids: ['defib'], weight: 35, deadline: 6, why: 'Ventricular fibrillation needs a shock as soon as possible.', source: SRC.ARREST },
    { label: 'Give epinephrine', ids: ['epinephrine'], weight: 15, deadline: 12, why: 'Epinephrine is given in a shockable arrest after the second shock.', source: SRC.ARREST },
    { label: 'Give amiodarone', ids: ['amiodarone'], weight: 10, deadline: 20, why: 'Amiodarone is for ventricular fibrillation that persists after shocks.', source: SRC.ARREST },
    { label: 'Ventilate with oxygen', ids: ['oxygen'], weight: 10, deadline: 10, why: 'Breaths go with compressions.', source: SRC.ARREST },
  ],

  sounds: (s) => (s.flags.rosc ? { heart: 'normal', lungs: 'clear' } : { heart: 'none', lungs: 'none' }),

  rules: [
    'Severity (0 to 1) rises by 0.045 per minute. Compressions multiply that by 0.45, epinephrine by 0.8, amiodarone by 0.9 and oxygen by 0.95.',
    'Heart rate and blood pressure read zero until a pulse returns. The rhythm is ventricular fibrillation.',
    'Each shock is counted. A pulse returns on the second shock or later only if compressions are running and epinephrine has been given. Otherwise the rhythm stays in fibrillation.',
    'When a pulse returns, severity is capped at 0.45, then falls by 0.03 per minute. The patient stabilizes when severity is 0.2 or less. The patient dies when severity reaches 1.',
    'After a pulse returns, compressions, a shock or epinephrine add 0.06 to severity. A synchronized shock or a pericardiocentesis in arrest adds 0.06.',
  ],
};
