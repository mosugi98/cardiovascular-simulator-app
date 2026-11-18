import { lin, round } from '../engine/util.js';
import { SRC } from './sources.js';

export const P = {
  startSeverity: 0.35,
  growthPerMin: 0.007,
  aspirinFactor: 0.75,
  heparinFactor: 0.85,
  p2y12Factor: 0.9,
  pciDelayMin: 30,
  reperfusionRatePerMin: -0.025,
  stableSeverity: 0.2,
  hypotensionSbp: 100,
  shockSeverity: 0.6,
  nitroSbpDrop: 12,
  nitroDurationMin: 30,
  stElevMv: 0.25,
  residualStElevMv: 0.05,
  harm: {
    nitroWhenHypotensive: 0.08,
    metoprolol: 0.06,
    fluids: 0.06,
    diltiazem: 0.06,
    pericardiocentesis: 0.1,
    cardioversion: 0.05,
    norepi: 0.05,
  },
  vitals: {
    hr: [62, 80], sbp: [190, -120], dbp: [114, -72], spo2: [100, -11], rr: [14, 16], temp: [36.8, 0],
  },
  hrCap: 140,
};

const harm = (s, amount) => { s.severity = Math.min(1, s.severity + amount); };

export default {
  id: 'stemi-anterior',
  name: 'Anterior STEMI',
  caseNumber: 101,
  prefix: 'ACS',
  categories: ['Acute Coronary Syndrome'],
  chiefComplaints: ['Chest pain'],
  unreleased: false,
  patient: '58-year-old man with 45 minutes of crushing central chest pain spreading to the left arm. He smokes and has high blood pressure. He arrived by ambulance and is sweaty and anxious.',
  monitorLead: 'V2',
  deathRhythm: 'vf',
  params: P,

  triage: { level: 2, label: 'Emergent' },
  person: { age: 58, sex: 'man', pose: 'reclined', skin: '#B97D5A', hair: '#2b2623', bay: 4 },
  look: { sweaty: true, jvp: () => false, edema: false, dyspnea: (s) => s.severity > 0.7 },
  handover: 'Paramedic handover: 58-year-old man with 45 minutes of crushing central chest pain that began while he carried shopping upstairs. He smokes and is treated for high blood pressure (amlodipine). No known allergies. He has not taken any aspirin. Pain 8 out of 10, sweaty and nauseated.',
  speech(s) {
    if (s.flags.reperfused) return 'The pain is much better. Thank you.';
    if (s.severity > 0.7) return 'I feel like I am going to pass out.';
    if (s.severity > 0.5) return 'The pressure is getting worse. I feel sick.';
    return 'It feels like an elephant is sitting on my chest.';
  },
  echo: (s) => ({
    ef: 0.4, lv: 1, la: 1, wall: 1, effusion: 0, rvCollapse: false, mr: false,
    hypokinesis: 'anterior-apex',
    caption: s.flags.reperfused
      ? 'Anterior wall and apex still move poorly after reperfusion. Estimated ejection fraction about 40%. No pericardial effusion.'
      : 'Anterior wall and apex barely move. Estimated ejection fraction about 40%. No pericardial effusion.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates(s) {
    const f = s.flags;
    if (f.reperfused) return P.reperfusionRatePerMin;
    let r = P.growthPerMin;
    if (f.aspirin) r *= P.aspirinFactor;
    if (f.heparin) r *= P.heparinFactor;
    if (f.p2y12) r *= P.p2y12Factor;
    return r;
  },

  events(s) {
    const f = s.flags;
    if (f.pciAt != null && !f.reperfused && s.t >= f.pciAt) {
      f.reperfused = true;
      return ['Primary PCI is complete: the blocked LAD artery is open again. His chest pain is easing.'];
    }
    return [];
  },

  targets(s) {
    const f = s.flags;
    let sbp = lin(P.vitals.sbp, s.severity);
    if (f.nitroAt != null && s.t - f.nitroAt < P.nitroDurationMin) sbp -= P.nitroSbpDrop;
    return {
      vitals: {
        hr: Math.min(P.hrCap, lin(P.vitals.hr, s.severity)),
        sbp,
        dbp: lin(P.vitals.dbp, s.severity),
        spo2: lin(P.vitals.spo2, s.severity),
        rr: lin(P.vitals.rr, s.severity),
        temp: lin(P.vitals.temp, s.severity),
      },
      rhythm: 'sinus',
      ecg: {
        stElev: f.reperfused ? P.residualStElevMv : P.stElevMv,
        amp: 1,
        pattern: f.reperfused ? 'anterior-stemi-reperfused' : 'anterior-stemi',
      },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'He went into cardiogenic shock and then ventricular fibrillation. The blocked artery was not opened in time.' };
    if (s.flags.reperfused && s.severity <= P.stableSeverity) return { status: 'stabilized', reason: 'He is pain-free and stable after reperfusion. He is moving to the coronary care unit.' };
    return null;
  },

  treat: {
    aspirin: { rating: 'helpful', why: 'Aspirin limits further clot growth in an acute heart attack.', source: SRC.STEMI, apply: (s) => { s.flags.aspirin = true; }, text: 'He chews the aspirin.' },
    heparin: { rating: 'helpful', why: 'Anticoagulation is given alongside primary PCI.', source: SRC.STEMI, apply: (s) => { s.flags.heparin = true; }, text: 'Heparin is given.' },
    p2y12: { rating: 'helpful', why: 'A P2Y12 inhibitor is loaded as part of dual antiplatelet therapy for PCI.', source: SRC.STEMI, apply: (s) => { s.flags.p2y12 = true; }, text: 'Ticagrelor is given.' },
    cathLab: {
      rating: 'helpful', why: 'Primary PCI is the preferred way to reopen the artery, ideally within 90 minutes of first medical contact.', source: SRC.STEMI,
      apply: (s) => { if (s.flags.pciAt == null) { s.flags.pciAt = s.t + P.pciDelayMin; } },
      text: `The cath lab team is on the way. The artery should be open in about ${P.pciDelayMin} minutes.`,
    },
    nitro: {
      rate: (s) => (s.vitals.sbp < P.hypotensionSbp
        ? { rating: 'harmful', why: 'Nitrates lower blood pressure and are unsafe when systolic pressure is low.', source: SRC.CHEST_PAIN }
        : { rating: 'helpful', why: 'Nitroglycerin relieves ischemic chest pain when blood pressure is adequate.', source: SRC.CHEST_PAIN }),
      apply: (s) => { if (s.vitals.sbp < P.hypotensionSbp) harm(s, P.harm.nitroWhenHypotensive); s.flags.nitroAt = s.t; },
      text: 'Nitroglycerin is placed under his tongue.',
    },
    oxygen: { rating: 'neutral', why: 'Oxygen is not needed when oxygen saturation is 90% or higher.', source: SRC.STEMI, text: 'Oxygen is started.' },
    metoprolol: {
      rate: (s) => (s.severity > P.shockSeverity || s.vitals.sbp < P.hypotensionSbp
        ? { rating: 'harmful', why: 'IV beta-blockers can trigger shock when the heart is already failing or pressure is low.', source: SRC.STEMI }
        : { rating: 'neutral', why: 'IV beta-blockers are not routine early in STEMI. Oral therapy within 24 hours is reasonable if there is no heart failure or shock.', source: SRC.STEMI }),
      apply: (s) => { if (s.severity > P.shockSeverity || s.vitals.sbp < P.hypotensionSbp) harm(s, P.harm.metoprolol); },
      text: 'Metoprolol is given IV.',
    },
    fluids: { rating: 'harmful', why: 'Extra volume raises the filling pressure of an injured left ventricle and risks pulmonary edema.', source: SRC.STEMI, apply: (s) => { harm(s, P.harm.fluids); }, text: 'A fluid bolus runs in.' },
    diltiazem: { rating: 'harmful', why: 'Diltiazem weakens heart contraction and is not recommended after a large anterior heart attack.', source: SRC.STEMI, apply: (s) => { harm(s, P.harm.diltiazem); }, text: 'Diltiazem is given.' },
    pericardiocentesis: { rating: 'harmful', why: 'There is no pericardial effusion to drain, so the procedure only adds the risk of injuring the heart.', source: SRC.PERICARDIAL, apply: (s) => { harm(s, P.harm.pericardiocentesis); }, text: 'The needle is placed. No fluid is found.' },
    cardioversion: { rating: 'harmful', why: 'He is in sinus rhythm, so a shock has no benefit and can trigger a dangerous arrhythmia.', source: SRC.AF, apply: (s) => { harm(s, P.harm.cardioversion); }, text: 'A synchronized shock is delivered.' },
    norepi: { rating: 'harmful', why: 'Vasopressors raise afterload and oxygen demand when blood pressure is not low.', source: SRC.STEMI, apply: (s) => { harm(s, P.harm.norepi); }, text: 'Norepinephrine is started.' },
    furosemide: { rating: 'neutral', why: 'There is no fluid overload, so a diuretic does not help.', source: SRC.HF, text: 'Furosemide is given.' },
    niv: { rating: 'neutral', why: 'He is not in respiratory failure.', source: '', text: 'BiPAP is applied.' },
  },

  exam: {
    inspect: (s) => (s.flags.reperfused
      ? 'Comfortable, pain-free, no longer sweating.'
      : s.severity > 0.7 ? 'Grey, drenched in sweat, drowsy and in severe distress.' : 'Anxious, pale and sweaty, clutching his chest.'),
    heartSounds: (s) => `Regular rhythm at about ${round(s.vitals.hr)}/min. Normal first and second sounds, a soft fourth sound, no murmur.`,
    lungs: (s) => (s.severity > 0.7 ? 'Crackles at both lung bases.' : 'Clear on both sides.'),
    jvp: () => 'Neck veins are not raised.',
    pulses: (s) => (s.severity > 0.7 ? 'Weak, fast pulses. Cold, clammy hands and feet.' : 'Pulses strong and equal in both arms. Warm hands.'),
  },

  tests: {
    ecg12: (s) => (s.flags.reperfused
      ? `Sinus rhythm ${round(s.vitals.hr)}/min. ST elevation in V1 to V4 is falling, with new T wave inversion. Reperfusion pattern.`
      : `Sinus rhythm ${round(s.vitals.hr)}/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Anterior STEMI.`),
    troponin: () => 'Troponin I 0.12 ng/mL (normal below 0.04), and rising.',
    bnp: () => 'BNP 210 pg/mL, mildly raised.',
    bmp: () => 'Potassium 4.1, sodium 139, creatinine 1.0 mg/dL, glucose 128 mg/dL.',
    cxr: (s) => ((s.flags.fluids ?? 0) > 0 ? 'Normal heart size. Early vascular congestion after the fluid bolus.' : 'Normal heart size. Clear lung fields.'),
    echo: () => 'Hypokinesis of the anterior wall and apex. Estimated ejection fraction 40%. No pericardial effusion.',
  },

  useful: {
    ecg12: { why: 'The 12-lead ECG makes the diagnosis and starts reperfusion.', source: SRC.STEMI },
    troponin: { why: 'Troponin supports the diagnosis, but it must not delay reperfusion.', source: SRC.CHEST_PAIN },
    lungs: { why: 'Checking for pulmonary edema affects drug choices.', source: SRC.STEMI },
    heartSounds: { why: 'Listening for a new murmur or gallop shows mechanical complications.', source: SRC.STEMI },
  },

  key: [
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 20, deadline: 10, why: 'The ECG should be done and read within 10 minutes of arrival.', source: SRC.STEMI },
    { label: 'Give aspirin', ids: ['aspirin'], weight: 15, deadline: 15, why: 'Aspirin should be given early.', source: SRC.STEMI },
    { label: 'Activate the cath lab for primary PCI', ids: ['cathLab'], weight: 35, deadline: 20, why: 'Reperfusion is the treatment that changes the outcome, and delay costs heart muscle.', source: SRC.STEMI },
    { label: 'Give heparin', ids: ['heparin'], weight: 10, deadline: 30, why: 'Anticoagulation supports PCI.', source: SRC.STEMI },
    { label: 'Load a P2Y12 inhibitor', ids: ['p2y12'], weight: 10, deadline: 30, why: 'Dual antiplatelet therapy supports PCI.', source: SRC.STEMI },
    { label: 'Give nitroglycerin for pain', ids: ['nitro'], weight: 10, deadline: 30, why: 'It relieves ischemic pain while blood pressure is adequate.', source: SRC.CHEST_PAIN },
  ],

  sounds: (s) => ({ heart: 'normal', lungs: s.severity > 0.7 ? 'crackles' : 'clear' }),

  rules: [
    'Severity (0 to 1) rises each minute by the growth rate until the artery is reopened. Aspirin multiplies the growth rate by 0.75, heparin by 0.85 and a P2Y12 inhibitor by 0.9.',
    'Activating the cath lab opens the artery 30 minutes later. After that, severity falls by 0.025 per minute.',
    'The patient stabilizes when the artery is open and severity is 0.2 or less. The patient dies when severity reaches 1.',
    'Nitroglycerin lowers systolic pressure by 12 mmHg for 30 minutes. It adds 0.08 to severity if systolic pressure is below 100.',
    'IV metoprolol is neutral unless severity is above 0.6 or systolic pressure is below 100, when it adds 0.06.',
  ],
};
