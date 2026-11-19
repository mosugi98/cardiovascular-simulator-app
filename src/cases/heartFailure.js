import { lin, round } from '../engine/util.js';
import { SRC } from './sources.js';
import * as R from './results/heartFailure.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.55,
  growthPerMin: 0.008,
  oxygenRelief: 0.003,
  nivRelief: 0.012,
  furosemideRelief: 0.01,
  nitroRelief: 0.006,
  nitroDurationMin: 40,
  nitroMinSbp: 110,
  nitroSbpDrop: 15,
  nitroHypotensionHarm: 0.08,
  stableSeverity: 0.2,
  stableSpo2: 92,
  spo2Boost: { niv: 5, oxygen: 3 },
  improvingSeverity: 0.3,
  harm: { metoprolol: 0.12, diltiazem: 0.15, fluids: 0.12, pericardiocentesis: 0.08, cardioversion: 0.05, norepi: 0.08 },
  vitals: {
    hr: [75, 60], sbp: [185, -30], dbp: [110, -22], spo2: [99, -24], rr: [18, 22], temp: [36.9, 0],
  },
};

const harm = (s, amount) => { s.severity = Math.min(1, s.severity + amount); };
const harmful = (why, amount, text, source = SRC.HF) => ({
  rating: 'harmful', why, source, apply: (s) => { harm(s, amount); }, text,
});

export default {
  id: 'adhf',
  name: 'Acute Decompensated Heart Failure',
  caseNumber: 301,
  prefix: 'HF',
  categories: ['Heart Failure'],
  chiefComplaints: ['Shortness of breath', 'Leg swelling'],
  unreleased: false,
  patient: '72-year-old man with known heart failure (ejection fraction about 30%). For 3 days he has had worsening breathlessness, needs to sleep sitting up, and his legs are swollen. He ran out of his water pill a week ago.',
  monitorLead: 'II',
  deathRhythm: 'asystole',
  params: P,

  triage: { level: 2, label: 'Emergent' },
  person: { age: 72, sex: 'man', pose: 'upright', skin: '#D2A07A', hair: '#e4e2de', bay: 5 },
  look: { sweaty: false, jvp: () => true, edema: true, dyspnea: (s) => s.severity > 0.3 },
  handover: 'Paramedic handover: 72-year-old man with known heart failure. Three days of worsening breathlessness, sleeping on three pillows, swollen legs. He ran out of his water pill (furosemide) a week ago. Oxygen saturation 84% on air. No known allergies.',
  speech(s) {
    if (s.severity <= 0.3) return 'That is better. I can talk properly now.';
    if (s.severity > 0.7) return 'Cannot... breathe...';
    return 'I cannot catch my breath. I cannot lie down.';
  },
  echo: (s) => ({
    ef: 0.25, lv: s.severity <= P.improvingSeverity ? 1.2 : 1.3, la: 1.4, wall: 0.7, effusion: 0, rvCollapse: false, mr: s.severity > P.improvingSeverity, hypokinesis: null,
    caption: s.severity <= P.improvingSeverity
      ? 'Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is now mild and the inferior vena cava collapses with breathing. No pericardial effusion.'
      : s.flags.furosemide
        ? 'Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is lessening and the inferior vena cava is less dilated. No pericardial effusion.'
        : 'Dilated left ventricle with ejection fraction about 25%. Moderate functional mitral regurgitation. No pericardial effusion.',
  }),

  history: {
    speaker: 'Patient',
    chips: ['complaint', 'onset', 'breathless', 'swelling', 'pmh', 'meds', 'adherence', 'allergies'],
    answers: {
      complaint: 'I cannot breathe properly, and my legs are swollen.',
      onset: 'It has crept up over three days.',
      severity: (s) => (s.severity <= 0.3 ? 'The breathlessness is a 3 out of 10 now.' : 'The breathlessness is a 9 out of 10.'),
      breathless: 'Yes. I cannot lie flat. I sleep on three pillows and wake up gasping.',
      swelling: 'Yes, up to my knees.',
      palpitations: 'My heart is going fast, but it is regular.',
      prior: 'Yes. I was in hospital with this last winter.',
      pmh: 'Heart failure for four years, and a heart attack ten years ago.',
      meds: 'Furosemide, ramipril and bisoprolol.',
      adherence: 'I ran out of my water tablet a week ago. I could not get to the pharmacy.',
      allergies: 'None that I know of.',
      family: 'My brother had heart failure.',
      social: 'I stopped smoking ten years ago. No alcohol.',
      lastmeal: 'Soup at lunchtime. I could not eat much.',
      infection: 'No cough or fever.',
    },
  },
  auscultation: R.auscultation,

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    let r = P.growthPerMin;
    if (f.niv) r -= P.nivRelief;
    else if (f.oxygen) r -= P.oxygenRelief;
    if (f.furosemide) r -= P.furosemideRelief;
    if (f.nitroAt != null && s.t - f.nitroAt < P.nitroDurationMin) r -= P.nitroRelief;
    return r;
  },

  events: () => [],

  targets(s) {
    const f = s.flags;
    let sbp = lin(P.vitals.sbp, s.severity);
    if (f.nitroAt != null && s.t - f.nitroAt < P.nitroDurationMin) sbp -= P.nitroSbpDrop;
    const boost = f.niv ? P.spo2Boost.niv : f.oxygen ? P.spo2Boost.oxygen : 0;
    return {
      vitals: {
        hr: lin(P.vitals.hr, s.severity),
        sbp,
        dbp: lin(P.vitals.dbp, s.severity),
        spo2: Math.min(100, lin(P.vitals.spo2, s.severity) + boost),
        rr: lin(P.vitals.rr, s.severity),
        temp: lin(P.vitals.temp, s.severity),
      },
      rhythm: 'sinus',
      ecg: { amp: 1, pattern: 'lbbb' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'Fluid filled his lungs and he went into respiratory failure and cardiac arrest.' };
    if (s.severity <= P.stableSeverity && s.vitals.spo2 >= P.stableSpo2) return { status: 'stabilized', reason: 'He is breathing comfortably with a good oxygen level after diuresis. He is moving to the cardiac ward.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.HF),
    oxygen: { rating: 'helpful', why: 'Oxygen treats his low saturation while the cause is addressed.', source: SRC.HF, apply: (s) => { s.flags.oxygen = true; }, text: 'Oxygen is started.' },
    niv: { rating: 'helpful', why: 'BiPAP improves oxygenation and reduces the work of breathing in pulmonary edema.', source: SRC.HF, apply: (s) => { s.flags.niv = true; }, text: 'BiPAP is applied. His breathing eases.' },
    furosemide: { rating: 'helpful', why: 'IV loop diuretic removes the excess fluid and is the main treatment for congestion.', source: SRC.HF, apply: (s) => { s.flags.furosemide = true; }, text: 'Furosemide is given IV.' },
    nitro: {
      rate: (s) => (s.vitals.sbp >= P.nitroMinSbp
        ? { rating: 'helpful', why: 'Nitroglycerin lowers filling pressure and eases breathlessness when blood pressure is high.', source: SRC.HF }
        : { rating: 'harmful', why: 'Blood pressure is too low for a nitrate to be safe.', source: SRC.HF }),
      apply: (s) => {
        if (s.vitals.sbp < P.nitroMinSbp) harm(s, P.nitroHypotensionHarm);
        s.flags.nitroAt = s.t;
      },
      text: 'Nitroglycerin is given.',
    },
    metoprolol: harmful('A beta-blocker weakens the heart further during acute decompensation.', P.harm.metoprolol, 'Metoprolol is given. He becomes more breathless.'),
    diltiazem: harmful('Diltiazem weakens heart contraction and is harmful when the ejection fraction is low.', P.harm.diltiazem, 'Diltiazem is given. He becomes more breathless.'),
    fluids: harmful('He is already overloaded with fluid, and more volume worsens the pulmonary edema.', P.harm.fluids, 'A fluid bolus runs in. His breathing worsens.'),
    pericardiocentesis: harmful('There is no effusion to drain.', P.harm.pericardiocentesis, 'The needle is placed. No fluid is found.', SRC.PERICARDIAL),
    cardioversion: harmful('He is in sinus rhythm, so a shock has no benefit.', P.harm.cardioversion, 'A synchronized shock is delivered.', SRC.AF),
    norepi: harmful('A vasopressor raises afterload in a patient whose blood pressure is already high.', P.harm.norepi, 'Norepinephrine is started.'),
    aspirin: { rating: 'neutral', why: 'This is not an acute coronary syndrome.', source: SRC.HF, text: 'Aspirin is given.' },
    heparin: { rating: 'neutral', why: 'There is no anticoagulation indication.', source: SRC.HF, text: 'Heparin is given.' },
    p2y12: { rating: 'neutral', why: 'There is no acute coronary syndrome.', source: SRC.HF, text: 'Ticagrelor is given.' },
    cathLab: { rating: 'neutral', why: 'There is no ST elevation or coronary occlusion.', source: SRC.HF, text: 'The cath lab team stands by.' },
  },

  exam: R.exam,
  tests: R.tests,
  unchanged: R.unchanged,

  useful: {
    ecg12: { why: 'The ECG excludes an acute heart attack as the trigger.', source: SRC.HF },
    bnp: { why: 'BNP supports the diagnosis of heart failure.', source: SRC.HF },
    bmp: { why: 'Potassium and kidney function guide diuretic therapy.', source: SRC.HF },
    cxr: { why: 'The chest X-ray confirms pulmonary edema.', source: SRC.HF },
    echo: { why: 'Echocardiography shows the cause and heart function.', source: SRC.HF },
    lungs: { why: 'Crackles show how congested the lungs are.', source: SRC.HF },
    jvp: { why: 'Neck veins show how much fluid he is holding.', source: SRC.HF },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 10, deadline: 10, why: 'It excludes an acute coronary trigger.', source: SRC.HF },
    { label: 'Support breathing (BiPAP or oxygen)', ids: ['niv', 'oxygen'], weight: 25, deadline: 15, why: 'His oxygen saturation is low.', source: SRC.HF },
    { label: 'Give IV furosemide', ids: ['furosemide'], weight: 30, deadline: 20, why: 'A diuretic removes the excess fluid.', source: SRC.HF },
    { label: 'Give nitroglycerin while blood pressure is high', ids: ['nitro'], weight: 15, deadline: 25, why: 'It lowers filling pressure and eases breathing.', source: SRC.HF },
    { label: 'Check electrolytes and kidney function', ids: ['bmp'], weight: 10, deadline: 30, why: 'It guides diuretic dosing.', source: SRC.HF },
    { label: 'Confirm with a chest X-ray, BNP or echocardiogram', ids: ['cxr', 'bnp', 'echo'], weight: 10, deadline: 30, why: 'It confirms the diagnosis.', source: SRC.HF },
  ],

  // The gallop is heard at the apex only. The crackles are heard at the bases first.
  sounds: (s, area) => ({
    heart: area && area !== 'mitral' ? 'normal' : 's3',
    lungs: area === 'upper' && s.severity <= P.improvingSeverity ? 'clear' : 'crackles',
  }),

  rules: [
    'Severity (0 to 1) rises by 0.008 per minute.',
    'Oxygen alone lowers that by 0.003 per minute. BiPAP lowers it by 0.012 (and replaces the oxygen effect). Furosemide lowers it by 0.01. Nitroglycerin lowers it by 0.006 for 40 minutes.',
    'BiPAP raises oxygen saturation by 5 points and oxygen alone by 3.',
    'Nitroglycerin is helpful when systolic pressure is 110 or higher. Below that it adds 0.08 to severity.',
    'IV metoprolol adds 0.12, diltiazem 0.15, a fluid bolus 0.12, pericardiocentesis 0.08, cardioversion 0.05 and norepinephrine 0.08 to severity.',
    'The patient stabilizes when severity is 0.2 or less and oxygen saturation is 92% or higher. The patient dies when severity reaches 1.',
  ],
};
