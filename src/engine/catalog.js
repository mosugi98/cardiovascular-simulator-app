/**
 * Every action a learner can take. The same menu is shown for every case, so
 * choosing the right ones is part of the exercise. `cost` is the number of
 * minutes the action takes in learning mode (turn-based). In challenge mode the
 * clock runs by itself and costs are not applied.
 */
export const CATALOG = {
  wait: { kind: 'wait', group: 'Observe', label: 'Observe the patient for 5 minutes', cost: 5 },

  inspect: { kind: 'exam', group: 'Examine', label: 'General inspection', cost: 1 },
  heartSounds: { kind: 'exam', group: 'Examine', label: 'Listen to the heart', cost: 1 },
  lungs: { kind: 'exam', group: 'Examine', label: 'Listen to the lungs', cost: 1 },
  jvp: { kind: 'exam', group: 'Examine', label: 'Check neck veins (JVP)', cost: 1 },
  pulses: { kind: 'exam', group: 'Examine', label: 'Check pulses and perfusion', cost: 1 },

  ecg12: { kind: 'test', group: 'Tests', label: '12-lead ECG', cost: 3 },
  troponin: { kind: 'test', group: 'Tests', label: 'Troponin', cost: 15 },
  bnp: { kind: 'test', group: 'Tests', label: 'BNP', cost: 15 },
  bmp: { kind: 'test', group: 'Tests', label: 'Electrolytes and creatinine', cost: 15 },
  cxr: { kind: 'test', group: 'Tests', label: 'Chest X-ray', cost: 10 },
  echo: { kind: 'test', group: 'Tests', label: 'Bedside echocardiogram', cost: 8 },

  oxygen: { kind: 'treat', group: 'Treatments', label: 'Oxygen by mask', cost: 1 },
  niv: { kind: 'treat', group: 'Treatments', label: 'Non-invasive ventilation (BiPAP)', cost: 5 },
  aspirin: { kind: 'treat', group: 'Treatments', label: 'Aspirin 325 mg, chewed', cost: 1 },
  heparin: { kind: 'treat', group: 'Treatments', label: 'Heparin IV (anticoagulation)', cost: 2 },
  p2y12: { kind: 'treat', group: 'Treatments', label: 'Ticagrelor loading dose', cost: 2 },
  nitro: { kind: 'treat', group: 'Treatments', label: 'Nitroglycerin sublingual', cost: 1 },
  metoprolol: { kind: 'treat', group: 'Treatments', label: 'Metoprolol IV', cost: 2 },
  diltiazem: { kind: 'treat', group: 'Treatments', label: 'Diltiazem IV', cost: 3 },
  furosemide: { kind: 'treat', group: 'Treatments', label: 'Furosemide 40 mg IV', cost: 2 },
  fluids: { kind: 'treat', group: 'Treatments', label: 'IV fluid bolus 500 mL', cost: 5 },
  norepi: { kind: 'treat', group: 'Treatments', label: 'Norepinephrine infusion', cost: 3 },
  cardioversion: { kind: 'treat', group: 'Treatments', label: 'Synchronized cardioversion', cost: 5 },
  cathLab: { kind: 'treat', group: 'Treatments', label: 'Activate cath lab (primary PCI)', cost: 2 },
  pericardiocentesis: { kind: 'treat', group: 'Treatments', label: 'Pericardiocentesis', cost: 10 },
  cpr: { kind: 'treat', group: 'Treatments', label: 'Start chest compressions (CPR)', cost: 1 },
  defib: { kind: 'treat', group: 'Treatments', label: 'Defibrillate (unsynchronized shock)', cost: 1 },
  epinephrine: { kind: 'treat', group: 'Treatments', label: 'Epinephrine IV', cost: 1 },
  amiodarone: { kind: 'treat', group: 'Treatments', label: 'Amiodarone IV', cost: 3 },
  adenosine: { kind: 'treat', group: 'Treatments', label: 'Adenosine rapid IV push', cost: 2 },
  vagal: { kind: 'treat', group: 'Treatments', label: 'Vagal maneuver (modified Valsalva)', cost: 2 },
  labetalol: { kind: 'treat', group: 'Treatments', label: 'Labetalol IV', cost: 3 },
  nicardipine: { kind: 'treat', group: 'Treatments', label: 'Nicardipine IV infusion', cost: 3 },
  dobutamine: { kind: 'treat', group: 'Treatments', label: 'Dobutamine infusion', cost: 3 },

  // Questions put to the patient (or paramedic). Not shown as a button: the History panel asks them.
  history: { kind: 'history', group: 'History', label: 'Ask a question', cost: 1 },
};

export const GROUPS = ['Examine', 'Tests', 'Treatments'];
