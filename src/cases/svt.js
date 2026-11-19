import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.25,
  growthPerMin: 0.003,
  sinusRatePerMin: -0.02,
  vagalRelief: 0.02,
  stableSeverity: 0.2,
  stableHrBelow: 110,
  harm: { norepi: 0.1 },
  hrCap: 220,
  vitals: { hrSvt: [157, 100], hrSinus: [70, 30], sbp: [140, -60], dbp: [90, -40], spo2: [99, -6], rr: [14, 16], temp: [36.8, 0] },
};

const harm = (s, a) => { s.severity = Math.min(1, s.severity + a); };
const convert = (s, text) => { s.flags.sinus = true; addEvent(s, text); };

export default {
  id: 'svt-stable',
  name: 'Stable Supraventricular Tachycardia',
  caseNumber: 202,
  prefix: 'ARR',
  categories: ['Arrhythmia'],
  chiefComplaints: ['Palpitations'],
  unreleased: false,
  patient: '31-year-old woman with a sudden racing heartbeat. She is anxious but comfortable, talking in full sentences, and her blood pressure is normal.',
  monitorLead: 'II',
  deathRhythm: 'vf',
  params: P,

  triage: { level: 3, label: 'Urgent' },
  person: { age: 31, sex: 'woman', pose: 'reclined', skin: '#E8C2A0', hair: '#5a3b2a', bay: 7 },
  look: { sweaty: false, jvp: () => false, edema: false, dyspnea: (s) => s.severity > 0.7 },
  handover: 'Paramedic handover: 31-year-old woman with a sudden racing heartbeat that began 40 minutes ago at her desk. No chest pain. She has had two similar short episodes that stopped by themselves. Healthy, no regular medicines. Heart rate 180, regular. Blood pressure 126 over 80.',
  speech: (s) => (s.flags.sinus ? 'Oh, that is much better.' : 'It started all at once. My heart is pounding.'),
  history: {
    speaker: 'Patient',
    chips: ['complaint', 'onset', 'palpitations', 'prior', 'pmh', 'meds', 'social', 'allergies'],
    answers: {
      complaint: (s) => (s.flags.sinus ? 'My heart feels normal again.' : 'My heart suddenly started racing.'),
      onset: 'Forty minutes ago, at my desk. It came on all at once.',
      severity: 'It is not painful, just very uncomfortable.',
      location: 'In my chest, and I can feel it in my neck.',
      palpitations: 'Yes. It is fast and perfectly regular, like a machine.',
      syncope: 'A bit light-headed, but I have not fainted.',
      breathless: 'A little.',
      prior: 'Twice before. Short episodes that stopped by themselves.',
      pmh: 'Nothing. I am healthy.',
      meds: 'Only the contraceptive pill.',
      adherence: 'I take it every day.',
      allergies: 'Penicillin gives me a rash.',
      family: 'No heart problems in my family.',
      social: 'Three or four coffees a day, and an energy drink this morning. I do not smoke.',
      lastmeal: 'A sandwich at lunch.',
    },
  },
  auscultation: {
    heart: {
      aortic: (s) => (s.flags.sinus ? 'Regular. Normal sounds.' : 'Very fast and regular. No murmur at the aortic area.'),
      pulmonic: (s) => (s.flags.sinus ? 'Regular. Normal sounds.' : 'Very fast and regular. No murmur at the pulmonic area.'),
      tricuspid: (s) => (s.flags.sinus ? 'Regular. Normal sounds.' : 'Very fast and regular. No murmur at the lower left sternal edge.'),
      mitral: (s) => (s.flags.sinus ? 'Regular. Normal sounds.' : 'Very fast and regular, too fast to separate the heart sounds. No murmur.'),
    },
    lungs: { upper: () => 'Clear in the upper zones.', lower: () => 'Clear at the bases.' },
  },
  echo: () => ({
    ef: 0.6, lv: 1, la: 1, wall: 1, effusion: 0, rvCollapse: false, mr: false, hypokinesis: null,
    caption: 'Normal pumping, ejection fraction about 60%. Normal valves. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates: (s) => (s.flags.sinus ? P.sinusRatePerMin : P.growthPerMin),
  events: () => [],

  targets(s) {
    const v = P.vitals;
    const sinus = s.flags.sinus;
    return {
      vitals: {
        hr: sinus ? lin(v.hrSinus, s.severity) : Math.min(P.hrCap, lin(v.hrSvt, s.severity)),
        sbp: lin(v.sbp, s.severity), dbp: lin(v.dbp, s.severity), spo2: lin(v.spo2, s.severity), rr: lin(v.rr, s.severity), temp: lin(v.temp, s.severity),
      },
      rhythm: sinus ? 'sinus' : 'svt',
      ecg: { amp: 1, pattern: sinus ? 'normal' : 'svt' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'The fast rhythm went on for hours and caused cardiovascular collapse.' };
    if (s.flags.sinus && s.severity <= P.stableSeverity && s.vitals.hr < P.stableHrBelow) return { status: 'stabilized', reason: 'Her heart rate is normal and she feels well. She goes to the observation unit.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.SVT, ['epinephrine', 'defib', 'labetalol', 'nicardipine', 'cpr']),
    vagal: {
      rating: 'helpful', why: 'A vagal maneuver is the first treatment for a stable regular narrow tachycardia. It often fails and does no harm.', source: SRC.SVT,
      apply: (s) => { s.severity = Math.max(0, s.severity - P.vagalRelief); s.flags.vagal = true; },
      text: 'She bears down for 15 seconds, then lies back with her legs raised. The rate slows for a moment, then races again.',
    },
    adenosine: {
      rating: 'helpful', why: 'Adenosine stops the re-entry circuit and is the first drug for a regular narrow tachycardia.', source: SRC.SVT,
      apply: (s) => convert(s, 'After a brief pause the rhythm returns to sinus. She feels a flush and chest tightness for a few seconds.'),
      text: 'Adenosine is given as a rapid push, followed by a saline flush.',
    },
    diltiazem: {
      rating: 'helpful', why: 'Diltiazem is an alternative if adenosine does not work, in a patient who is stable with normal heart function.', source: SRC.SVT,
      apply: (s) => convert(s, 'Over a few minutes the rate slows and the rhythm returns to sinus.'),
      text: 'Diltiazem is given slowly IV.',
    },
    metoprolol: {
      rating: 'helpful', why: 'A beta-blocker is an alternative if adenosine does not work, in a stable patient.', source: SRC.SVT,
      apply: (s) => convert(s, 'Over a few minutes the rate slows and the rhythm returns to sinus.'),
      text: 'Metoprolol is given slowly IV.',
    },
    cardioversion: {
      rating: 'neutral', why: 'Not needed while she is stable. A vagal maneuver and adenosine come first, and a shock needs sedation.', source: SRC.SVT,
      apply: (s) => convert(s, 'The shock converts the rhythm to sinus.'),
      text: 'She is sedated and a synchronized shock is delivered.',
    },
    norepi: { rating: 'harmful', why: 'A vasopressor raises blood pressure and can make the tachycardia worse. She is not hypotensive.', source: SRC.SVT, apply: (s) => harm(s, P.harm.norepi), text: 'Norepinephrine is started. Her heart rate rises further.' },
    oxygen: { rating: 'neutral', why: 'Her oxygen saturation is normal.', source: SRC.SVT, text: 'Oxygen is started.' },
  },

  exam: {
    inspect: (s) => (s.flags.sinus ? 'Calm and comfortable.' : 'Anxious but comfortable, a little pale, talking in full sentences.'),
    heartSounds: (s) => (s.flags.sinus ? `Regular at about ${round(s.vitals.hr)}/min. Normal sounds.` : `Very fast and perfectly regular, about ${round(s.vitals.hr)}/min. Normal sounds, no murmur.`),
    lungs: () => 'Clear on both sides.',
    jvp: (s) => (s.flags.sinus ? 'Not raised.' : 'Not raised. Rapid regular pulsations are visible in the neck.'),
    pulses: (s) => (s.flags.sinus ? 'Regular pulse, equal in both arms.' : 'Fast, regular, thready radial pulse, too fast to count exactly. Warm hands.'),
  },

  tests: {
    ecg12: (s) => (s.flags.sinus
      ? `Sinus rhythm ${round(s.vitals.hr)}/min. Normal. No delta wave.`
      : `Regular narrow-complex tachycardia at ${round(s.vitals.hr)}/min with no visible P waves and mild ST depression. Supraventricular tachycardia.`),
    troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
    bnp: () => 'BNP 40 pg/mL, normal.',
    bmp: () => 'Potassium 4.1, magnesium 2.0, creatinine 0.8 mg/dL.',
    cxr: () => 'Normal heart size. Clear lung fields.',
    echo: () => 'Normal pumping, ejection fraction about 60%. Normal valves. No pericardial effusion.',
  },

  useful: {
    ecg12: { why: 'The ECG confirms a regular narrow-complex tachycardia and looks for pre-excitation.', source: SRC.SVT },
    bmp: { why: 'Potassium and magnesium matter before giving rhythm drugs.', source: SRC.SVT },
    pulses: { why: 'Checking the pulse and perfusion shows she is stable.', source: SRC.SVT },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 20, deadline: 10, why: 'It confirms the rhythm.', source: SRC.SVT },
    { label: 'Try a vagal maneuver first', ids: ['vagal'], weight: 20, deadline: 8, why: 'It is the first treatment for a stable regular narrow tachycardia.', source: SRC.SVT },
    { label: 'Convert with adenosine (or diltiazem or a beta-blocker)', ids: ['adenosine', 'diltiazem', 'metoprolol'], weight: 40, deadline: 20, why: 'Adenosine ends the tachycardia.', source: SRC.SVT },
    { label: 'Check the pulse and perfusion', ids: ['pulses'], weight: 10, deadline: 10, why: 'It shows she is stable and a shock is not needed.', source: SRC.SVT },
    { label: 'Check electrolytes', ids: ['bmp'], weight: 10, deadline: 30, why: 'Low potassium or magnesium makes rhythms worse.', source: SRC.SVT },
  ],

  sounds: () => ({ heart: 'normal', lungs: 'clear' }),

  rules: [
    'Severity (0 to 1) rises by 0.003 per minute while the tachycardia continues. After conversion to sinus it falls by 0.02 per minute.',
    'A vagal maneuver lowers severity by 0.02 once but does not convert the rhythm.',
    'Adenosine, diltiazem, metoprolol or a synchronized shock converts the rhythm to sinus.',
    'The patient stabilizes when the rhythm is sinus, severity is 0.2 or less and heart rate is below 110. The patient dies when severity reaches 1.',
    'Norepinephrine adds 0.1 to severity.',
  ],
};
