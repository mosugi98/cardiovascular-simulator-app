import { lin, round, addEvent } from '../engine/util.js';
import { SRC } from './sources.js';

export const P = {
  startSeverity: 0.45,
  growthPerMin: 0.01,
  drainedRatePerMin: -0.06,
  stableSeverity: 0.2,
  fluidRelief: 0.06,
  fluidMaxEffective: 2,
  lowVoltageAmp: 0.5,
  harm: { nitro: 0.12, furosemide: 0.1, metoprolol: 0.12, niv: 0.12, cardioversion: 0.04 },
  hrCap: 165,
  vitals: {
    hr: [85, 100], sbp: [120, -80], dbp: [86, -60], spo2: [99, -14], rr: [14, 28], temp: [37.4, 0],
  },
};

const harm = (s, amount) => { s.severity = Math.min(1, s.severity + amount); };

const preloadHarm = (why, amount, text, source = SRC.PERICARDIAL) => ({
  rating: 'harmful', why, source, apply: (s) => { harm(s, amount); }, text,
});

export default {
  id: 'cardiac-tamponade',
  name: 'Cardiac Tamponade',
  caseNumber: 401,
  prefix: 'PER',
  categories: ['Pericardial Disease'],
  chiefComplaints: ['Chest pain', 'Shortness of breath'],
  unreleased: false,
  patient: '45-year-old man with 3 days of worsening shortness of breath and chest discomfort that is easier when he leans forward. He recently had a viral illness. He is pale, sitting upright and very anxious.',
  monitorLead: 'II',
  deathRhythm: 'asystole',
  params: P,

  triage: { level: 1, label: 'Resuscitation' },
  person: { age: 45, sex: 'man', pose: 'upright', skin: '#8F5E40', hair: '#1f1b19', bay: 1 },
  look: { sweaty: true, jvp: (s) => !s.flags.drained, edema: false, dyspnea: (s) => !s.flags.drained },
  handover: 'Paramedic handover: 45-year-old man with 3 days of worsening breathlessness and chest discomfort that is easier when he leans forward. He had a viral illness last week. No regular medicines, no known allergies. He has become paler and sleepier on the way in.',
  speech(s) {
    if (s.flags.drained) return 'I can breathe again.';
    if (s.severity > 0.7) return 'I cannot breathe. I am so tired.';
    return 'It hurts when I breathe in, and I cannot lie flat.';
  },
  echo: (s) => ({
    ef: 0.65, lv: 0.9, la: 1, wall: 1, mr: false, hypokinesis: null,
    effusion: s.flags.drained ? 0.15 : 1,
    rvCollapse: !s.flags.drained,
    caption: s.flags.drained
      ? 'Effusion reduced to a small rim. Right heart chambers fill normally.'
      : 'Large circumferential pericardial effusion with the right ventricle collapsing in diastole. Tamponade physiology.',
  }),

  setup: () => ({ severity: P.startSeverity, flags: {} }),

  rates: (s) => (s.flags.drained ? P.drainedRatePerMin : P.growthPerMin),

  events: () => [],

  targets(s) {
    const f = s.flags;
    return {
      vitals: {
        hr: Math.min(P.hrCap, lin(P.vitals.hr, s.severity)),
        sbp: lin(P.vitals.sbp, s.severity),
        dbp: lin(P.vitals.dbp, s.severity),
        spo2: lin(P.vitals.spo2, s.severity),
        rr: lin(P.vitals.rr, s.severity),
        temp: lin(P.vitals.temp, s.severity),
      },
      rhythm: 'sinus',
      ecg: { amp: f.drained ? 1 : P.lowVoltageAmp, alternans: !f.drained, pattern: f.drained ? 'pericarditis' : 'low-voltage' },
    };
  },

  end(s) {
    if (s.severity >= 1) return { status: 'dead', reason: 'Pressure in the sac around the heart rose until the heart could not fill. He had a pulseless electrical activity arrest.' };
    if (s.flags.drained && s.severity <= P.stableSeverity) return { status: 'stabilized', reason: 'His blood pressure and heart rate are back to normal after the fluid was drained. He is going to the cardiac ICU.' };
    return null;
  },

  treat: {
    pericardiocentesis: {
      rating: 'helpful', why: 'Draining the fluid is the definitive treatment for tamponade that is causing shock.', source: SRC.PERICARDIAL,
      apply: (s) => {
        if (!s.flags.drained) {
          s.flags.drained = true;
          addEvent(s, 'About 300 mL of fluid is drawn off the pericardium. His blood pressure starts to rise right away.');
        }
      },
      text: 'A needle is placed under ultrasound guidance and fluid is withdrawn.',
    },
    fluids: {
      repeatable: true,
      rate: (s) => ((s.flags.fluids ?? 0) < P.fluidMaxEffective
        ? { rating: 'helpful', why: 'A fluid bolus can briefly raise filling pressure and buy time before drainage.', source: SRC.PERICARDIAL }
        : { rating: 'neutral', why: 'More fluid adds little. Drain the effusion.', source: SRC.PERICARDIAL }),
      apply: (s) => {
        const n = s.flags.fluids ?? 0;
        if (n < P.fluidMaxEffective) s.severity = Math.max(0, s.severity - P.fluidRelief);
        s.flags.fluids = n + 1;
      },
      text: 'A fluid bolus runs in. His blood pressure improves slightly.',
    },
    nitro: preloadHarm('Nitrates lower preload, and the heart depends on its filling pressure in tamponade.', P.harm.nitro, 'Nitroglycerin is given. His blood pressure drops.'),
    furosemide: preloadHarm('A diuretic lowers filling pressure, which a heart in tamponade depends on.', P.harm.furosemide, 'Furosemide is given. His blood pressure drops.'),
    metoprolol: preloadHarm('A beta-blocker blunts the fast heart rate that is keeping his output up.', P.harm.metoprolol, 'Metoprolol is given. His heart rate falls and his blood pressure drops.'),
    niv: preloadHarm('Positive pressure reduces the blood returning to the heart and can cause collapse in tamponade.', P.harm.niv, 'BiPAP is applied. His blood pressure drops.'),
    cardioversion: preloadHarm('He is in sinus rhythm, so a shock has no benefit and adds risk.', P.harm.cardioversion, 'A synchronized shock is delivered.', SRC.AF),
    norepi: { rating: 'neutral', why: 'Vasopressors do not fix tamponade. The fluid has to be drained.', source: SRC.PERICARDIAL, text: 'Norepinephrine is started.' },
    oxygen: { rating: 'neutral', why: 'Oxygen helps a little but does not treat the cause.', source: SRC.PERICARDIAL, text: 'Oxygen is started.' },
    aspirin: { rating: 'neutral', why: 'This is not a heart attack.', source: SRC.PERICARDIAL, text: 'Aspirin is given.' },
    cathLab: { rating: 'neutral', why: 'There is no coronary occlusion, so PCI does not help.', source: SRC.PERICARDIAL, text: 'The cath lab team stands by.' },
  },

  exam: {
    inspect: (s) => (s.flags.drained
      ? 'Calmer, color returning, breathing easier.'
      : 'Pale, sweaty and anxious, sitting upright and breathing fast.'),
    heartSounds: (s) => (s.flags.drained
      ? `Regular, normal heart sounds at about ${round(s.vitals.hr)}/min.`
      : `Distant, muffled heart sounds, fast at about ${round(s.vitals.hr)}/min.`),
    lungs: () => 'Clear on both sides.',
    jvp: (s) => (s.flags.drained
      ? 'Neck veins are back to a normal height.'
      : 'Neck veins are markedly raised, about 14 cm, and do not fall when he breathes in.'),
    pulses: (s) => (s.flags.drained
      ? 'Strong, regular pulses.'
      : 'Fast, thin pulses. The systolic pressure falls by about 15 mmHg when he breathes in (pulsus paradoxus).'),
  },

  tests: {
    ecg12: (s) => (s.flags.drained
      ? `Sinus rhythm ${round(s.vitals.hr)}/min. Normal voltage. Diffuse mild ST elevation with PR depression (pericarditis).`
      : `Sinus tachycardia ${round(s.vitals.hr)}/min. Low voltage QRS complexes with electrical alternans (the QRS height alternates beat to beat).`),
    troponin: () => 'Troponin I below 0.04 ng/mL (normal).',
    bnp: () => 'BNP 80 pg/mL, normal.',
    bmp: () => 'Potassium 4.4, creatinine 1.3 mg/dL, slightly high from poor perfusion.',
    cxr: () => 'Enlarged, globe-shaped heart outline. Clear lung fields.',
    echo: (s) => (s.flags.drained
      ? 'Effusion reduced to a small rim. Right heart chambers fill normally. IVC collapses with breathing.'
      : 'Large circumferential pericardial effusion (about 2.5 cm) with the right atrium and right ventricle collapsing in diastole. Dilated IVC that does not collapse. Tamponade physiology.'),
  },

  useful: {
    echo: { why: 'Bedside echocardiography confirms the effusion and tamponade physiology.', source: SRC.PERICARDIAL },
    ecg12: { why: 'Low voltage and electrical alternans support the diagnosis.', source: SRC.PERICARDIAL },
    heartSounds: { why: 'Muffled heart sounds are part of the classic picture.', source: SRC.PERICARDIAL },
    jvp: { why: 'Raised neck veins are part of the classic picture (Beck triad).', source: SRC.PERICARDIAL },
    pulses: { why: 'Pulsus paradoxus points to tamponade.', source: SRC.PERICARDIAL },
  },

  key: [
    { label: 'Get a bedside echocardiogram', ids: ['echo'], weight: 30, deadline: 15, why: 'It confirms the effusion and shows tamponade.', source: SRC.PERICARDIAL },
    { label: 'Drain the fluid (pericardiocentesis)', ids: ['pericardiocentesis'], weight: 40, deadline: 30, why: 'Draining the fluid is the definitive treatment.', source: SRC.PERICARDIAL },
    { label: 'Examine for muffled sounds, raised neck veins or pulsus paradoxus', ids: ['heartSounds', 'jvp', 'pulses'], weight: 10, deadline: 10, why: 'The bedside signs point to the diagnosis.', source: SRC.PERICARDIAL },
    { label: 'Give a fluid bolus to buy time', ids: ['fluids'], weight: 10, deadline: 20, why: 'Temporizing fluid can help until the fluid is drained.', source: SRC.PERICARDIAL },
    { label: 'Get a 12-lead ECG', ids: ['ecg12'], weight: 10, deadline: 15, why: 'It shows low voltage and alternans.', source: SRC.PERICARDIAL },
  ],

  sounds: (s) => ({ heart: s.flags.drained ? 'normal' : 'muffled', lungs: 'clear' }),

  rules: [
    'Severity (0 to 1) rises by 0.01 per minute until the fluid is drained. After pericardiocentesis it falls by 0.06 per minute.',
    'A fluid bolus lowers severity by 0.06, for the first two boluses only.',
    'Nitroglycerin adds 0.12, furosemide 0.1, IV metoprolol 0.12, non-invasive ventilation 0.12 and cardioversion 0.04 to severity.',
    'The ECG shows low voltage (half height) with electrical alternans until the fluid is drained.',
    'The patient stabilizes when the fluid is drained and severity is 0.2 or less. The patient dies when severity reaches 1.',
  ],
};
