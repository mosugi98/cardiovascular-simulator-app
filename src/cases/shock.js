import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';
import * as R from './results/shock.js';
import { unindicated } from './shared.js';

export const P = {
  startSeverity: 0.5,
  growthPerMin: 0.015,
  norepiRelief: 0.008,
  dobutamineRelief: 0.005,
  nivRelief: 0.003,
  oxygenRelief: 0.001,
  aspirinRelief: 0.001,
  pciDelayMin: 30,
  reperfusionRatePerMin: -0.03,
  stableSeverity: 0.25,
  stableSbp: 90,
  norepiSbpSupport: 18,
  harm: { fluids: 0.1, nitro: 0.12, metoprolol: 0.15, diltiazem: 0.15, cardioversion: 0.05, pericardiocentesis: 0.08 },
  vitals: { hr: [90, 60], sbp: [130, -110], dbp: [85, -60], spo2: [98, -22], rr: [16, 24], temp: [36.6, -0.6] },
  hrCap: 150,
};

const harm = (s, a) => { s.severity = Math.min(1, s.severity + a); };
const harmful = (why, amount, text) => ({ rating: 'harmful', why, source: SRC.SHOCK, apply: (s) => harm(s, amount), text });

export default {
  id: 'cardiogenic-shock',
  name: 'Cardiogenic Shock',
  caseNumber: 501,
  prefix: 'SHK',
  categories: ['Shock'],
  chiefComplaints: ['Chest pain', 'Shortness of breath', 'Confusion'],
  unreleased: false,
  patient: '64-year-old man with 3 hours of crushing chest pain. He is now cold, clammy, confused and struggling to breathe, and his blood pressure is falling.',
  monitorLead: 'V2',
  deathRhythm: 'vf',
  params: P,

  triage: { level: 1, label: 'Resuscitation' },
  person: { age: 64, sex: 'man', pose: 'reclined', skin: '#C48B66', hair: '#cfcac4', bay: 3 },
  look: { sweaty: true, jvp: () => true, edema: false, dyspnea: (s) => s.severity > 0.4 },
  handover: 'Paramedic handover: 64-year-old man with 3 hours of crushing central chest pain, now confused, sweaty and short of breath. Blood pressure 82 over 54 and falling, heart rate 118, oxygen saturation 86% on air. Two previous heart attacks and diabetes. He has had no treatment. No known allergies.',
  speech(s) {
    if (s.flags.reperfused) return 'The pain has gone. I can breathe again.';
    if (s.severity > 0.7) return 'I... cannot... I feel like I am dying.';
    return 'I feel terrible. I cannot breathe, and my chest is so tight.';
  },
  history: {
    speaker: 'Patient',
    chips: ['complaint', 'onset', 'severity', 'pmh', 'meds', 'allergies'],
    answers: {
      complaint: 'My chest has been squeezing for hours. And I cannot breathe.',
      onset: 'This morning. About three hours ago.',
      severity: '7 out of 10.',
      location: 'All across my chest.',
      radiation: 'Into my left arm.',
      sweating: 'Yes, I am soaked.',
      nausea: 'I have been sick twice.',
      breathless: 'Yes. I cannot lie flat. I am drowning.',
      syncope: 'I feel like I will pass out.',
      prior: 'Two heart attacks before, but nothing like today.',
      pmh: 'Two heart attacks and diabetes.',
      meds: 'Aspirin, metoprolol, ramipril and metformin.',
      adherence: 'I take them every day.',
      allergies: 'None.',
      social: 'I gave up smoking after my last heart attack.',
      family: 'My brother died of a heart attack.',
      lastmeal: 'Breakfast. I have not kept anything down since.',
    },
  },
  auscultation: R.auscultation,
  echo: (s) => ({
    ef: s.flags.reperfused ? 0.2 : 0.15, lv: 1.3, la: 1.2, wall: 0.7, effusion: 0, rvCollapse: false, mr: !s.flags.reperfused, hypokinesis: 'anterior-apex',
    caption: s.flags.reperfused
      ? 'Severely reduced pumping, ejection fraction about 20%. The anterior wall and apex are stunned and barely move. The mitral regurgitation is milder. No pericardial effusion.'
      : 'Severely reduced pumping, ejection fraction about 15%. The anterior wall and apex do not move. Moderate mitral regurgitation. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    if (f.reperfused) return P.reperfusionRatePerMin;
    let r = P.growthPerMin;
    if (f.norepi) r -= P.norepiRelief;
    if (f.dobutamine) r -= P.dobutamineRelief;
    if (f.niv) r -= P.nivRelief; else if (f.oxygen) r -= P.oxygenRelief;
    if (f.aspirin) r -= P.aspirinRelief;
    return r;
  },

  events(s) {
    const f = s.flags;
    if (f.pciAt != null && !f.reperfused && s.t >= f.pciAt) {
      f.reperfused = true;
      return ['Primary PCI is complete: the blocked artery is open again. His blood pressure begins to rise.'];
    }
    return [];
  },

  targets(s) {
    const f = s.flags;
    const v = P.vitals;
    return {
      vitals: {
        hr: Math.min(P.hrCap, lin(v.hr, s.severity)),
        sbp: lin(v.sbp, s.severity) + (f.norepi ? P.norepiSbpSupport : 0),
        dbp: lin(v.dbp, s.severity),
        spo2: lin(v.spo2, s.severity) + (f.niv ? 5 : f.oxygen ? 3 : 0),
        rr: lin(v.rr, s.severity),
        temp: lin(v.temp, s.severity),
      },
      rhythm: 'sinus',
      ecg: { amp: 1, stElev: f.reperfused ? 0.05 : 0.25, pattern: f.reperfused ? 'anterior-stemi-reperfused' : 'anterior-stemi' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'The pump failure got worse until he went into cardiac arrest.' };
    if (s.flags.reperfused && s.severity <= P.stableSeverity && s.vitals.sbp >= P.stableSbp) return { status: 'stabilized', reason: 'The artery is open and his blood pressure is holding. He is moving to the coronary care unit.' };
    return null;
  },

  treat: {
    ...unindicated(SRC.SHOCK),
    norepi: { rating: 'helpful', why: 'Norepinephrine is the first-choice vasopressor in cardiogenic shock. It holds up blood pressure while the artery is opened.', source: SRC.SHOCK, apply: (s) => { s.flags.norepi = true; }, text: 'Norepinephrine is started through a central line. His blood pressure begins to rise.' },
    dobutamine: { rating: 'helpful', why: 'An inotrope helps a failing heart pump harder when blood pressure is supported.', source: SRC.SHOCK, apply: (s) => { s.flags.dobutamine = true; }, text: 'Dobutamine is started. His heart pumps a little harder.' },
    cathLab: {
      rating: 'helpful', why: 'Reopening the blocked artery is the treatment that changes the outcome in shock from a heart attack.', source: SRC.SHOCK,
      apply: (s) => { if (s.flags.pciAt == null) s.flags.pciAt = s.t + P.pciDelayMin; },
      text: `The cath lab team is on the way. The artery should be open in about ${P.pciDelayMin} minutes.`,
    },
    oxygen: { rating: 'helpful', why: 'He is hypoxic and needs oxygen.', source: SRC.SHOCK, apply: (s) => { s.flags.oxygen = true; }, text: 'Oxygen is started.' },
    niv: { rating: 'helpful', why: 'BiPAP supports breathing in pulmonary edema, with close watch on blood pressure.', source: SRC.SHOCK, apply: (s) => { s.flags.niv = true; }, text: 'BiPAP is applied.' },
    aspirin: { rating: 'helpful', why: 'Aspirin is still part of acute coronary syndrome care.', source: SRC.STEMI, apply: (s) => { s.flags.aspirin = true; }, text: 'Aspirin is given.' },
    fluids: harmful('Fluid overloads a failing left ventricle and floods the lungs.', P.harm.fluids, 'A fluid bolus runs in. His breathing worsens.'),
    nitro: harmful('Nitrates drop blood pressure further when he is already in shock.', P.harm.nitro, 'Nitroglycerin is given. His blood pressure drops.'),
    metoprolol: harmful('A beta-blocker weakens the heart and can tip a patient in shock into arrest.', P.harm.metoprolol, 'Metoprolol is given. His blood pressure falls.'),
    diltiazem: harmful('Diltiazem weakens heart contraction and drops blood pressure.', P.harm.diltiazem, 'Diltiazem is given. His blood pressure falls.'),
    cardioversion: harmful('He is in sinus rhythm, so a shock has no benefit.', P.harm.cardioversion, 'A synchronized shock is delivered.'),
    pericardiocentesis: harmful('There is no effusion to drain.', P.harm.pericardiocentesis, 'The needle is placed. No fluid is found.'),
    furosemide: { rating: 'neutral', why: 'A diuretic can help the lungs once blood pressure is supported, but it does not treat the shock.', source: SRC.SHOCK, text: 'Furosemide is given.' },
  },

  exam: R.exam,
  tests: R.tests,
  unchanged: R.unchanged,

  useful: {
    ecg12: { why: 'The ECG shows the cause: a large anterior heart attack.', source: SRC.SHOCK },
    echo: { why: 'Echo shows the pump failure and excludes tamponade and a ruptured valve.', source: SRC.SHOCK },
    bmp: { why: 'Lactate and kidney function show how badly organs are starved of blood.', source: SRC.SHOCK },
    pulses: { why: 'Cold hands and feet and weak pulses show the shock.', source: SRC.SHOCK },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 15, deadline: 10, why: 'It finds the cause quickly.', source: SRC.SHOCK },
    { label: 'Get a bedside echocardiogram', ids: ['echo'], weight: 15, deadline: 15, why: 'It confirms pump failure and excludes other causes of shock.', source: SRC.SHOCK },
    { label: 'Start norepinephrine to support blood pressure', ids: ['norepi'], weight: 25, deadline: 15, why: 'Blood pressure must be held while the artery is opened.', source: SRC.SHOCK },
    { label: 'Activate the cath lab', ids: ['cathLab'], weight: 30, deadline: 20, why: 'Reopening the artery is the treatment that changes the outcome.', source: SRC.SHOCK },
    { label: 'Start dobutamine to help the pump', ids: ['dobutamine'], weight: 10, deadline: 30, why: 'An inotrope supports a failing heart.', source: SRC.SHOCK },
    { label: 'Support breathing (BiPAP or oxygen)', ids: ['niv', 'oxygen'], weight: 5, deadline: 15, why: 'He is hypoxic.', source: SRC.SHOCK },
  ],

  sounds: (s, area) => ({
    heart: area && area !== 'mitral' ? 'normal' : 's3',
    lungs: s.flags.reperfused && area === 'upper' ? 'clear' : 'crackles',
  }),

  rules: [
    'Severity (0 to 1) rises by 0.015 per minute. Norepinephrine lowers that by 0.008, dobutamine by 0.005, BiPAP by 0.003 (oxygen alone by 0.001) and aspirin by 0.001.',
    'Norepinephrine also lifts systolic pressure by 18 mmHg.',
    'Activating the cath lab opens the artery 30 minutes later. After that severity falls by 0.03 per minute.',
    'The patient stabilizes when the artery is open, severity is 0.25 or less and systolic pressure is 90 or more. The patient dies when severity reaches 1.',
    'A fluid bolus adds 0.1, nitroglycerin 0.12, metoprolol 0.15, diltiazem 0.15, cardioversion 0.05 and pericardiocentesis 0.08 to severity.',
  ],
};
