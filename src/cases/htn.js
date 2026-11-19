import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';
import * as R from './results/htn.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.5,
  growthPerMin: 0.005,
  agentRelief: 0.012,
  furosemideRelief: 0.004,
  nitroRelief: 0.005,
  nitroDurationMin: 40,
  stableSeverity: 0.2,
  stableSbp: 175,
  overshoot: { sbpDrop: 70, dbpDrop: 40, durationMin: 30, harm: 0.1 },
  harm: { aspirin: 0.05, heparin: 0.08, fluids: 0.05, norepi: 0.1 },
  vitals: { hr: [75, 46], sbp: [100, 276], dbp: [60, 152], spo2: [99, -10], rr: [14, 16], temp: [36.9, 0] },
};

const harm = (s, a) => { s.severity = Math.min(1, s.severity + a); };
const harmful = (why, amount, text) => ({ rating: 'harmful', why, source: SRC.HTN, apply: (s) => harm(s, amount), text });

/** The first IV blood-pressure drug helps. A second one on top drops the pressure too fast. */
const ivAgent = (label) => ({
  rate: (s) => (s.flags.agent
    ? { rating: 'harmful', why: 'A second IV drug on top of the first lowers the pressure too fast and risks stroke, heart and kidney injury.', source: SRC.HTN }
    : { rating: 'helpful', why: `${label} lowers the pressure gradually. The aim is to fall by no more than 25% in the first hour.`, source: SRC.HTN }),
  apply: (s) => {
    const f = s.flags;
    if (f.agent) {
      f.overshootAt = s.t;
      harm(s, P.overshoot.harm);
      addEvent(s, 'His blood pressure falls too fast. He becomes drowsy and cold.');
    } else {
      f.agent = true;
    }
  },
  text: `${label} is started. The pressure begins to come down.`,
});

export default {
  id: 'hypertensive-emergency',
  name: 'Hypertensive Emergency',
  caseNumber: 701,
  prefix: 'HTN',
  categories: ['Hypertension'],
  chiefComplaints: ['Headache', 'Blurred vision', 'Shortness of breath'],
  unreleased: false,
  patient: '52-year-old man with a severe headache, blurred vision and breathlessness. His blood pressure is dangerously high.',
  monitorLead: 'II',
  deathRhythm: 'asystole',
  params: P,

  triage: { level: 2, label: 'Emergent' },
  person: { age: 52, sex: 'man', pose: 'reclined', skin: '#A87555', hair: '#3a3532', bay: 1 },
  look: { sweaty: true, jvp: () => false, edema: false, dyspnea: (s) => s.severity > 0.4 },
  handover: 'Paramedic handover: 52-year-old man with a severe headache, blurred vision and breathlessness since yesterday evening. Blood pressure 238 over 136, checked three times. He has high blood pressure and ran out of his tablets two weeks ago. Oxygen saturation 94%. No known allergies.',
  speech(s) {
    if (s.severity <= 0.3) return 'The headache is much better.';
    if (s.severity > 0.7) return 'I cannot think straight...';
    return 'My head is pounding and I cannot see properly.';
  },
  history: {
    speaker: 'Patient',
    chips: ['complaint', 'onset', 'vision', 'pmh', 'meds', 'adherence', 'allergies'],
    answers: {
      complaint: 'My head is pounding and my vision is blurry.',
      onset: 'Since yesterday evening. It got worse today.',
      severity: 'The headache is a 9 out of 10.',
      location: 'All over my head, worst at the back.',
      vision: 'Everything is blurry.',
      neuro: 'I feel muddled, but I can move everything.',
      breathless: 'Yes, a bit, especially lying down.',
      nausea: 'I have vomited once.',
      prior: 'My pressure has been high before, but never this high.',
      pmh: 'High blood pressure for ten years.',
      meds: 'Amlodipine and lisinopril.',
      adherence: 'I ran out two weeks ago. I could not afford the refill.',
      allergies: 'None.',
      family: 'Both my parents had strokes.',
      social: 'I smoke. No cocaine or other drugs. Two coffees a day.',
      lastmeal: 'Breakfast.',
    },
  },
  auscultation: R.auscultation,
  echo: () => ({
    ef: 0.6, lv: 1, la: 1.2, wall: 1.5, effusion: 0, rvCollapse: false, mr: false, hypokinesis: null,
    caption: 'Thickened left ventricular walls with good pumping, ejection fraction about 60%. Mildly enlarged left atrium. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    let r = P.growthPerMin;
    if (f.agent) r -= P.agentRelief;
    if (f.furosemide) r -= P.furosemideRelief;
    if (f.nitroAt != null && s.t - f.nitroAt < P.nitroDurationMin) r -= P.nitroRelief;
    return r;
  },
  events: () => [],

  targets(s) {
    const f = s.flags;
    const v = P.vitals;
    const over = f.overshootAt != null && s.t - f.overshootAt < P.overshoot.durationMin;
    return {
      vitals: {
        hr: lin(v.hr, s.severity),
        sbp: lin(v.sbp, s.severity) - (over ? P.overshoot.sbpDrop : 0),
        dbp: lin(v.dbp, s.severity) - (over ? P.overshoot.dbpDrop : 0),
        spo2: lin(v.spo2, s.severity), rr: lin(v.rr, s.severity), temp: lin(v.temp, s.severity),
      },
      rhythm: 'sinus',
      ecg: { amp: 1, pattern: 'lvh-strain' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'The uncontrolled pressure caused a brain hemorrhage.' };
    if (s.severity <= P.stableSeverity && s.vitals.sbp <= P.stableSbp) return { status: 'stabilized', reason: 'His pressure is coming down steadily and the headache has eased. He is going to the high dependency unit.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.HTN, ['epinephrine', 'defib', 'adenosine', 'cpr']),
    labetalol: ivAgent('Labetalol'),
    nicardipine: ivAgent('Nicardipine'),
    nitro: { rating: 'helpful', why: 'Nitroglycerin lowers the pressure and eases the pulmonary edema.', source: SRC.HTN, apply: (s) => { s.flags.nitroAt = s.t; }, text: 'Nitroglycerin is given.' },
    furosemide: { rating: 'helpful', why: 'A loop diuretic treats the early pulmonary edema.', source: SRC.HTN, apply: (s) => { s.flags.furosemide = true; }, text: 'Furosemide is given IV.' },
    aspirin: harmful('An antiplatelet drug before a brain bleed is excluded can make a bleed worse.', P.harm.aspirin, 'Aspirin is given.'),
    heparin: harmful('Anticoagulation raises the risk of bleeding into the brain when the pressure is this high.', P.harm.heparin, 'Heparin is given.'),
    fluids: harmful('Fluid adds to the load on the heart and lungs.', P.harm.fluids, 'A fluid bolus runs in.'),
    norepi: harmful('A vasopressor raises a pressure that is already dangerously high.', P.harm.norepi, 'Norepinephrine is started. His pressure rises further.'),
    oxygen: { rating: 'neutral', why: 'His oxygen saturation is 94%, so oxygen is not needed.', source: SRC.HTN, text: 'Oxygen is started.' },
  },

  exam: R.exam,
  tests: R.tests,
  unchanged: R.unchanged,

  useful: {
    ecg12: { why: 'The ECG shows the strain on the heart and excludes a heart attack as the cause.', source: SRC.HTN },
    inspect: { why: 'A brief neurological check shows whether the brain is affected.', source: SRC.HTN },
    bmp: { why: 'Creatinine shows kidney injury, which is part of the diagnosis.', source: SRC.HTN },
    cxr: { why: 'The X-ray shows pulmonary edema and checks the aorta.', source: SRC.HTN },
    troponin: { why: 'Troponin shows whether the heart is also being injured.', source: SRC.HTN },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 10, deadline: 10, why: 'It shows heart strain and excludes a heart attack.', source: SRC.HTN },
    { label: 'Start one IV blood-pressure drug (labetalol or nicardipine)', ids: ['labetalol', 'nicardipine'], weight: 35, deadline: 20, why: 'A single IV drug lowers the pressure gradually.', source: SRC.HTN },
    { label: 'Check his neurological state', ids: ['inspect'], weight: 10, deadline: 10, why: 'It shows whether the brain is affected.', source: SRC.HTN },
    { label: 'Check kidney function and electrolytes', ids: ['bmp'], weight: 10, deadline: 30, why: 'Kidney injury is part of the diagnosis.', source: SRC.HTN },
    { label: 'Get a chest X-ray', ids: ['cxr'], weight: 10, deadline: 30, why: 'It shows pulmonary edema.', source: SRC.HTN },
    { label: 'Treat the pulmonary edema (furosemide or nitroglycerin)', ids: ['furosemide', 'nitro'], weight: 15, deadline: 30, why: 'The lungs are filling with fluid.', source: SRC.HTN },
    { label: 'Check troponin', ids: ['troponin'], weight: 10, deadline: 30, why: 'It shows whether the heart is injured.', source: SRC.HTN },
  ],

  sounds: (s) => ({ heart: 'normal', lungs: s.severity > 0.4 ? 'crackles' : 'clear' }),

  rules: [
    'Severity (0 to 1) rises by 0.005 per minute. The first IV blood-pressure drug lowers that by 0.012, furosemide by 0.004 and nitroglycerin by 0.005 for 40 minutes.',
    'Blood pressure follows severity (systolic 100 + 276 x severity, diastolic 60 + 152 x severity).',
    'A second IV blood-pressure drug adds 0.1 to severity and drops systolic pressure by 70 and diastolic by 40 mmHg for 30 minutes.',
    'The patient stabilizes when severity is 0.2 or less and systolic pressure is 175 or less. The patient dies when severity reaches 1.',
    'Aspirin adds 0.05, heparin 0.08, a fluid bolus 0.05 and norepinephrine 0.1 to severity.',
  ],
};
