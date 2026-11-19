import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';
import * as R from './results/vt.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.55,
  growthPerMin: 0.012,
  amiodaroneFactor: 0.7,
  sinusRatePerMin: -0.02,
  cardioversionBenefit: 0.4,
  recurAfterMin: 12,
  recurSeverity: 0.5,
  monitorMin: 15,
  stableSeverity: 0.2,
  oxygenRelief: 0.001,
  harm: { diltiazem: 0.15, metoprolol: 0.12, adenosine: 0.1, defib: 0.1 },
  hrCap: 220,
  vitals: { hrVt: [150, 70], hrSinus: [75, 40], sbp: [140, -115], dbp: [90, -75], spo2: [99, -11], rr: [14, 18], temp: [36.7, 0] },
};

const harm = (s, a) => { s.severity = Math.min(1, s.severity + a); };
const harmful = (why, amount, text) => ({ rating: 'harmful', why, source: SRC.VT, apply: (s) => harm(s, amount), text });

export default {
  id: 'vt-unstable',
  name: 'Unstable Ventricular Tachycardia',
  caseNumber: 203,
  prefix: 'ARR',
  categories: ['Arrhythmia'],
  chiefComplaints: ['Palpitations', 'Chest pain', 'Dizziness'],
  unreleased: false,
  patient: '57-year-old man with a fast, wide-complex rhythm. He is dizzy, confused and sweaty, and his blood pressure is low.',
  monitorLead: 'II',
  deathRhythm: 'vf',
  params: P,

  triage: { level: 1, label: 'Resuscitation' },
  person: { age: 57, sex: 'man', pose: 'reclined', skin: '#B88260', hair: '#8d8a86', bay: 6 },
  look: { sweaty: true, jvp: () => false, edema: false, dyspnea: (s) => s.severity > 0.6 },
  handover: 'Paramedic handover: 57-year-old man with sudden palpitations and chest tightness 20 minutes ago, now dizzy and confused. Heart attack two years ago, treated with a stent. Heart rate 190, blood pressure 80 over 50, oxygen saturation 93%. Contrast dye gave him a rash.',
  speech(s) {
    if (s.flags.sinus) return 'My heart has stopped racing.';
    if (s.severity > 0.7) return 'I am going to pass out...';
    return 'My heart is pounding. I feel dizzy and my chest is tight.';
  },
  history: {
    speaker: 'Patient',
    chips: ['complaint', 'onset', 'syncope', 'pmh', 'meds', 'allergies'],
    answers: {
      complaint: 'My heart started pounding and my chest got tight.',
      onset: 'About twenty minutes ago, while I was gardening.',
      severity: 'The chest tightness is a 5 out of 10.',
      palpitations: 'Yes. It is very fast and strong.',
      syncope: 'I nearly passed out. I feel faint now.',
      breathless: 'A little.',
      prior: 'Never like this.',
      pmh: 'A heart attack two years ago. I have a stent.',
      meds: 'Aspirin, atorvastatin, ramipril and metoprolol.',
      adherence: 'I take them every day.',
      allergies: 'Contrast dye gave me a rash.',
      family: 'My father died suddenly at 50.',
      social: 'Occasional alcohol. I do not smoke.',
      lastmeal: 'Lunch, two hours ago.',
    },
  },
  auscultation: R.auscultation,
  echo: () => ({
    ef: 0.3, lv: 1.15, la: 1, wall: 0.8, effusion: 0, rvCollapse: false, mr: false, hypokinesis: 'anterior-apex',
    caption: 'Reduced pumping, ejection fraction about 30%. A thin, akinetic scar in the anterior wall and apex. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    if (f.sinus) return P.sinusRatePerMin;
    let r = P.growthPerMin;
    if (f.amiodarone) r *= P.amiodaroneFactor;
    if (f.oxygen) r -= P.oxygenRelief;
    return r;
  },

  events(s) {
    const f = s.flags;
    if (f.sinus && !f.amiodarone && !f.recurred && s.t - f.cardioAt >= P.recurAfterMin) {
      f.sinus = false;
      f.recurred = true;
      s.severity = Math.max(s.severity, P.recurSeverity);
      return ['The wide-complex tachycardia has come back. His blood pressure is falling again.'];
    }
    return [];
  },

  targets(s) {
    const v = P.vitals;
    const sinus = s.flags.sinus;
    return {
      vitals: {
        hr: sinus ? lin(v.hrSinus, s.severity) : Math.min(P.hrCap, lin(v.hrVt, s.severity)),
        sbp: lin(v.sbp, s.severity), dbp: lin(v.dbp, s.severity), spo2: lin(v.spo2, s.severity), rr: lin(v.rr, s.severity), temp: lin(v.temp, s.severity),
      },
      rhythm: sinus ? 'sinus' : 'vt',
      ecg: { amp: 1, pattern: sinus ? 'normal' : 'vt' },
    };
  },

  end(s) {
    const f = s.flags;
    if (s.severity >= 1) return { status: 'dead', reason: 'The ventricular tachycardia degenerated into ventricular fibrillation.' };
    if (f.sinus && s.severity <= P.stableSeverity && (f.amiodarone || s.t - f.cardioAt >= P.monitorMin)) return { status: 'stabilized', reason: 'He is in sinus rhythm with a good blood pressure. He is going to the cardiac ICU for monitoring and further treatment.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.VT, ['epinephrine', 'labetalol', 'nicardipine', 'cpr']),
    cardioversion: {
      rate: (s) => (s.flags.sinus
        ? { rating: 'neutral', why: 'He is already in sinus rhythm.', source: SRC.VT }
        : { rating: 'helpful', why: 'Synchronized cardioversion is the treatment for a ventricular tachycardia that is causing low blood pressure.', source: SRC.VT }),
      apply: (s) => {
        if (s.flags.sinus) return;
        s.flags.sinus = true;
        s.flags.cardioAt = s.t;
        s.severity = Math.max(0, s.severity - P.cardioversionBenefit);
        addEvent(s, 'He is sedated and a synchronized shock converts the rhythm to sinus. His blood pressure rises.');
      },
      text: 'A synchronized shock is delivered.',
    },
    amiodarone: { rating: 'helpful', why: 'Amiodarone after cardioversion helps stop the tachycardia coming back.', source: SRC.VT, apply: (s) => { s.flags.amiodarone = true; }, text: 'Amiodarone is given IV over 10 minutes.' },
    oxygen: { rating: 'helpful', why: 'His oxygen saturation is low.', source: SRC.VT, apply: (s) => { s.flags.oxygen = true; }, text: 'Oxygen is started.' },
    diltiazem: harmful('A calcium channel blocker can collapse the blood pressure in ventricular tachycardia. A wide-complex tachycardia is ventricular until proven otherwise.', P.harm.diltiazem, 'Diltiazem is given. His blood pressure falls.'),
    metoprolol: harmful('A beta-blocker weakens a heart that is already failing and can drop blood pressure.', P.harm.metoprolol, 'Metoprolol is given. His blood pressure falls.'),
    adenosine: harmful('Adenosine does not treat ventricular tachycardia and can drop the blood pressure.', P.harm.adenosine, 'Adenosine is given. Nothing changes and his blood pressure falls.'),
    defib: harmful('An unsynchronized shock on a patient who has a pulse can trigger ventricular fibrillation.', P.harm.defib, 'An unsynchronized shock is delivered.'),
  },

  exam: R.exam,
  tests: R.tests,
  unchanged: R.unchanged,

  useful: {
    ecg12: { why: 'The 12-lead shows the wide-complex tachycardia, but must never delay a shock in an unstable patient.', source: SRC.VT },
    inspect: { why: 'Looking for pallor, sweating and confusion shows he is unstable.', source: SRC.VT },
    pulses: { why: 'A weak pulse and cool hands show poor perfusion.', source: SRC.VT },
    bmp: { why: 'Low potassium and magnesium make ventricular arrhythmias return.', source: SRC.VT },
    echo: { why: 'Echo shows the old scar that causes the rhythm.', source: SRC.VT },
  },

  key: [
    { label: 'Give a synchronized shock', ids: ['cardioversion'], weight: 40, deadline: 5, why: 'An unstable tachycardia needs a synchronized shock at once.', source: SRC.VT },
    { label: 'Assess perfusion', ids: ['inspect', 'pulses'], weight: 10, deadline: 5, why: 'It shows he is unstable.', source: SRC.VT },
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 10, deadline: 15, why: 'It confirms ventricular tachycardia once he is treated.', source: SRC.VT },
    { label: 'Give amiodarone to stop it returning', ids: ['amiodarone'], weight: 20, deadline: 20, why: 'It prevents a relapse after cardioversion.', source: SRC.VT },
    { label: 'Give oxygen', ids: ['oxygen'], weight: 10, deadline: 10, why: 'His saturation is low.', source: SRC.VT },
    { label: 'Check electrolytes', ids: ['bmp'], weight: 10, deadline: 30, why: 'Low potassium and magnesium need correcting.', source: SRC.VT },
  ],

  sounds: () => ({ heart: 'normal', lungs: 'clear' }),

  rules: [
    'Severity (0 to 1) rises by 0.012 per minute while the tachycardia continues. Amiodarone multiplies that by 0.7. Oxygen lowers it by 0.001.',
    'A synchronized shock converts the rhythm to sinus and lowers severity by 0.4. After that severity falls by 0.02 per minute.',
    'Without amiodarone the tachycardia comes back 12 minutes after the first shock, once, and severity returns to at least 0.5.',
    'The patient stabilizes when the rhythm is sinus, severity is 0.2 or less, and either amiodarone has been given or 15 minutes have passed since the shock. The patient dies when severity reaches 1.',
    'Diltiazem adds 0.15, metoprolol 0.12, adenosine 0.1 and an unsynchronized shock 0.1 to severity.',
  ],
};
