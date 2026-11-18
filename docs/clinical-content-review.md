# Clinical content review

This file is generated from the case data by `npm run review:gen`. Do not edit it by hand. A test fails if it is out of date.

**Status: drafted by an AI model from public guideline names. NOT clinically reviewed.** The simulator is an educational demo and must not be used for real patient care.

## How to review

- Citations give the guideline name only. Section numbers and recommendation classes have **not** been checked.
- Every number below (vitals, rates, doses, effects, timings, weights) is an invented simulation value, not a measured clinical figure. Check that each one is plausible and teaches the right lesson.
- "Severity" is a hidden number from 0 (well) to 1 (death) that drives the vital signs. Vital signs follow it as `value = a + b x severity` and drift toward that target with a lag of about 3 minutes.
- Mark each case reviewed or list the changes needed.

## Time and scoring rules

- Learning mode is turn-based. Each action advances the clock by its cost (see each action's minutes below).
- Challenge mode is real-time. 0.2 simulated minutes pass per real second (5 seconds = 1 minute). Action costs are not applied.
- Key actions are worth 70 points in total, split by each key action's weight. On time = full weight, late (after its deadline) = 50%, missed = 0.
- A stabilized patient earns 30 points. Any other outcome earns 0.
- Each harmful action costs 8 points, up to 40 in total.
- Score = key points + outcome points - harm penalty, rounded and kept between 0 and 100.
- A repeated helpful treatment is rated "no effect". Only the first two fluid boluses in tamponade count as helpful.
- Examinations and tests are rated helpful only if the case lists them as useful, and only the first time. Otherwise they are rated "no effect".

## Shared action menu

| Action | Type | Minutes (learning mode) |
| --- | --- | --- |
| Observe the patient for 5 minutes | wait | 5 |
| General inspection | exam | 1 |
| Listen to the heart | exam | 1 |
| Listen to the lungs | exam | 1 |
| Check neck veins (JVP) | exam | 1 |
| Check pulses and perfusion | exam | 1 |
| 12-lead ECG | test | 3 |
| Troponin | test | 15 |
| BNP | test | 15 |
| Electrolytes and creatinine | test | 15 |
| Chest X-ray | test | 10 |
| Bedside echocardiogram | test | 8 |
| Oxygen by mask | treat | 1 |
| Non-invasive ventilation (BiPAP) | treat | 5 |
| Aspirin 325 mg, chewed | treat | 1 |
| Heparin IV (anticoagulation) | treat | 2 |
| Ticagrelor loading dose | treat | 2 |
| Nitroglycerin sublingual | treat | 1 |
| Metoprolol IV | treat | 2 |
| Diltiazem IV | treat | 3 |
| Furosemide 40 mg IV | treat | 2 |
| IV fluid bolus 500 mL | treat | 5 |
| Norepinephrine infusion | treat | 3 |
| Synchronized cardioversion | treat | 5 |
| Activate cath lab (primary PCI) | treat | 2 |
| Pericardiocentesis | treat | 10 |

## Anterior STEMI (ACS-101)

**Categories:** Acute Coronary Syndrome. **Chief complaints:** Chest pain.

**Patient:** 58-year-old man with 45 minutes of crushing central chest pain spreading to the left arm. He smokes and has high blood pressure. He arrived by ambulance and is sweaty and anxious.

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 90 /min |
| Blood pressure | 148/89 mmHg |
| SpO2 | 96 % |
| Respiratory rate | 20 /min |
| Temperature | 36.8 C |
| Rhythm | sinus |
| Starting severity | 0.35 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.35 |
| growthPerMin | 0.007 |
| aspirinFactor | 0.75 |
| heparinFactor | 0.85 |
| p2y12Factor | 0.9 |
| pciDelayMin | 30 |
| reperfusionRatePerMin | -0.025 |
| stableSeverity | 0.2 |
| hypotensionSbp | 100 |
| shockSeverity | 0.6 |
| nitroSbpDrop | 12 |
| nitroDurationMin | 30 |
| stElevMv | 0.25 |
| residualStElevMv | 0.05 |
| harm.nitroWhenHypotensive | 0.08 |
| harm.metoprolol | 0.06 |
| harm.fluids | 0.06 |
| harm.diltiazem | 0.06 |
| harm.pericardiocentesis | 0.1 |
| harm.cardioversion | 0.05 |
| harm.norepi | 0.05 |
| vitals.hr | [62, 80] |
| vitals.sbp | [190, -120] |
| vitals.dbp | [114, -72] |
| vitals.spo2 | [100, -11] |
| vitals.rr | [14, 16] |
| vitals.temp | [36.8, 0] |
| hrCap | 140 |

### Rules

- Severity (0 to 1) rises each minute by the growth rate until the artery is reopened. Aspirin multiplies the growth rate by 0.75, heparin by 0.85 and a P2Y12 inhibitor by 0.9.
- Activating the cath lab opens the artery 30 minutes later. After that, severity falls by 0.025 per minute.
- The patient stabilizes when the artery is open and severity is 0.2 or less. The patient dies when severity reaches 1.
- Nitroglycerin lowers systolic pressure by 12 mmHg for 30 minutes. It adds 0.08 to severity if systolic pressure is below 100.
- IV metoprolol is neutral unless severity is above 0.6 or systolic pressure is below 100, when it adds 0.06.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Aspirin 325 mg, chewed | helpful | no | Aspirin limits further clot growth in an acute heart attack. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Heparin IV (anticoagulation) | helpful | no | Anticoagulation is given alongside primary PCI. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Ticagrelor loading dose | helpful | no | A P2Y12 inhibitor is loaded as part of dual antiplatelet therapy for PCI. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Activate cath lab (primary PCI) | helpful | no | Primary PCI is the preferred way to reopen the artery, ideally within 90 minutes of first medical contact. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Nitroglycerin sublingual | helpful | yes, see Parameters | Nitroglycerin relieves ischemic chest pain when blood pressure is adequate. | 2021 AHA/ACC Guideline for the Evaluation and Diagnosis of Chest Pain |
| Oxygen by mask | neutral | no | Oxygen is not needed when oxygen saturation is 90% or higher. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Metoprolol IV | neutral | yes, see Parameters | IV beta-blockers are not routine early in STEMI. Oral therapy within 24 hours is reasonable if there is no heart failure or shock. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| IV fluid bolus 500 mL | harmful | no | Extra volume raises the filling pressure of an injured left ventricle and risks pulmonary edema. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Diltiazem IV | harmful | no | Diltiazem weakens heart contraction and is not recommended after a large anterior heart attack. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Pericardiocentesis | harmful | no | There is no pericardial effusion to drain, so the procedure only adds the risk of injuring the heart. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Synchronized cardioversion | harmful | no | He is in sinus rhythm, so a shock has no benefit and can trigger a dangerous arrhythmia. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Norepinephrine infusion | harmful | no | Vasopressors raise afterload and oxygen demand when blood pressure is not low. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Furosemide 40 mg IV | neutral | no | There is no fluid overload, so a diuretic does not help. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Non-invasive ventilation (BiPAP) | neutral | no | He is not in respiratory failure. |  |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings at the start

| Exam | Finding |
| --- | --- |
| General inspection | Anxious, pale and sweaty, clutching his chest. |
| Listen to the heart | Regular rhythm at about 90/min. Normal first and second sounds, a soft fourth sound, no murmur. |
| Listen to the lungs | Clear on both sides. |
| Check neck veins (JVP) | Neck veins are not raised. |
| Check pulses and perfusion | Pulses strong and equal in both arms. Warm hands. |

### Test results at the start

| Test | Result |
| --- | --- |
| 12-lead ECG | Sinus rhythm 90/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Anterior STEMI. |
| Troponin | Troponin I 0.12 ng/mL (normal below 0.04), and rising. |
| BNP | BNP 210 pg/mL, mildly raised. |
| Electrolytes and creatinine | Potassium 4.1, sodium 139, creatinine 1.0 mg/dL, glucose 128 mg/dL. |
| Chest X-ray | Normal heart size. Clear lung fields. |
| Bedside echocardiogram | Hypokinesis of the anterior wall and apex. Estimated ejection fraction 40%. No pericardial effusion. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The 12-lead ECG makes the diagnosis and starts reperfusion. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Troponin | Troponin supports the diagnosis, but it must not delay reperfusion. | 2021 AHA/ACC Guideline for the Evaluation and Diagnosis of Chest Pain |
| Listen to the lungs | Checking for pulmonary edema affects drug choices. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Listen to the heart | Listening for a new murmur or gallop shows mechanical complications. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 20 | 10 | The ECG should be done and read within 10 minutes of arrival. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Give aspirin | Aspirin 325 mg, chewed | 15 | 15 | Aspirin should be given early. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Activate the cath lab for primary PCI | Activate cath lab (primary PCI) | 35 | 20 | Reperfusion is the treatment that changes the outcome, and delay costs heart muscle. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Give heparin | Heparin IV (anticoagulation) | 10 | 30 | Anticoagulation supports PCI. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Load a P2Y12 inhibitor | Ticagrelor loading dose | 10 | 30 | Dual antiplatelet therapy supports PCI. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Give nitroglycerin for pain | Nitroglycerin sublingual | 10 | 30 | It relieves ischemic pain while blood pressure is adequate. | 2021 AHA/ACC Guideline for the Evaluation and Diagnosis of Chest Pain |

### Sounds

At the start the simulated heart sound is "normal" and the lung sound is "clear". These are synthesized approximations.

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Atrial Fibrillation with RVR (ARR-201)

**Categories:** Arrhythmia. **Chief complaints:** Palpitations.

**Patient:** 68-year-old woman with 6 hours of a racing, uneven heartbeat and mild light-headedness. She has high blood pressure. She is awake, talking and comfortable at rest.

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 147 /min |
| Blood pressure | 118/73 mmHg |
| SpO2 | 97 % |
| Respiratory rate | 18 /min |
| Temperature | 36.7 C |
| Rhythm | afib |
| Starting severity | 0.3 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.3 |
| growthPerMin | 0.006 |
| rateControlRatePerMin | -0.012 |
| sinusRatePerMin | -0.02 |
| strokeGrowthPerMin | 0.01 |
| stableSeverity | 0.2 |
| unstableSeverity | 0.7 |
| unstableSbp | 90 |
| cardioversion.strokeHarm | 0.3 |
| cardioversion.unstableBenefit | 0.35 |
| cardioversion.anticoagulatedBenefit | 0.1 |
| harm.secondNodalBlocker | 0.1 |
| harm.pericardiocentesis | 0.1 |
| harm.fluids | 0.05 |
| harm.nitro | 0.05 |
| stableHrBelow | 110 |
| hrCap | 190 |
| vitals.hrUncontrolled | [105, 140] |
| vitals.hrRateControlled | [78, 90] |
| vitals.hrSinus | [64, 20] |
| vitals.sbp | [140, -75] |
| vitals.dbp | [88, -50] |
| vitals.spo2 | [99, -8] |
| vitals.rr | [14, 14] |
| vitals.temp | [36.7, 0] |

### Rules

- Severity (0 to 1) rises by 0.006 per minute while the rate is uncontrolled.
- A first AV-nodal blocker (diltiazem or metoprolol) lowers severity by 0.012 per minute. A second one adds 0.1 to severity.
- Cardioversion with unstable blood pressure (systolic below 90) lowers severity by 0.35. With anticoagulation it lowers severity by 0.1. Without anticoagulation in a stable patient it adds 0.3 (embolic stroke), then severity rises by 0.01 per minute.
- The patient stabilizes when rate is controlled (or sinus), there is no stroke, severity is 0.2 or less and heart rate is below 110. The patient dies when severity reaches 1.
- The patient is flagged unstable when severity reaches 0.7 while the rate is still uncontrolled.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Diltiazem IV | helpful | yes, see Parameters | Diltiazem slows the heart rate. Rate control is first-line for stable AF with a fast rate and preserved heart function. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Metoprolol IV | helpful | yes, see Parameters | Metoprolol slows the heart rate. Rate control is first-line for stable AF with a fast rate and preserved heart function. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Heparin IV (anticoagulation) | helpful | no | Her stroke risk is high (age 65 to 74, female, high blood pressure), so anticoagulation is indicated, especially around any cardioversion. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Synchronized cardioversion | harmful | yes, see Parameters | Cardioversion without anticoagulation risks a stroke from a clot in the atrium. She is stable, so there was no need to take that risk. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Pericardiocentesis | harmful | no | There is no effusion to drain, so the procedure only adds risk. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| IV fluid bolus 500 mL | harmful | no | Fluid does not slow the rate and risks congestion. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Nitroglycerin sublingual | harmful | no | Nitroglycerin has no role here and can lower blood pressure. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Oxygen by mask | neutral | no | Her oxygen saturation is normal. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Aspirin 325 mg, chewed | neutral | no | Aspirin does not replace anticoagulation for stroke prevention in AF. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings at the start

| Exam | Finding |
| --- | --- |
| General inspection | Anxious and a little short of breath, but comfortable at rest and speaking in full sentences. |
| Listen to the heart | Irregularly irregular and fast, about 147/min. No murmur. |
| Listen to the lungs | Clear on both sides. |
| Check neck veins (JVP) | Neck veins are not raised. |
| Check pulses and perfusion | Irregular pulse. The radial pulse is slower than the heartbeat heard at the chest (pulse deficit). |

### Test results at the start

| Test | Result |
| --- | --- |
| 12-lead ECG | Irregularly irregular rhythm with no P waves. Ventricular rate 147/min, narrow QRS. Atrial fibrillation with rapid ventricular response. |
| Troponin | Troponin I below 0.04 ng/mL (normal). |
| BNP | BNP 140 pg/mL, slightly raised for her age. |
| Electrolytes and creatinine | Potassium 3.6, magnesium 1.7 (low-normal), creatinine 0.9 mg/dL. |
| Chest X-ray | Normal heart size. Clear lung fields. |
| Bedside echocardiogram | Ejection fraction 55%. Mildly enlarged left atrium. No pericardial effusion. Bedside views cannot rule out a clot in the left atrial appendage. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The ECG confirms atrial fibrillation and excludes other rhythms and ischemia. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Electrolytes and creatinine | Low potassium or magnesium can drive arrhythmia, and kidney function guides dosing. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Bedside echocardiogram | Knowing heart function (ejection fraction) shows which rate-control drug is safe. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Check pulses and perfusion | Perfusion and a pulse deficit help judge stability. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 15 | 10 | It confirms the rhythm. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Start rate control (diltiazem or metoprolol) | Diltiazem IV or Metoprolol IV | 30 | 25 | Rate control is first-line for stable AF with a fast rate. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Start anticoagulation | Heparin IV (anticoagulation) | 20 | 45 | Her stroke risk is high. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Check electrolytes and kidney function | Electrolytes and creatinine | 10 | 30 | Correct low potassium or magnesium. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Check heart function with an echocardiogram | Bedside echocardiogram | 15 | 30 | It confirms a rate-control drug is safe. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Assess perfusion and the pulse | Check pulses and perfusion | 10 | 15 | It shows whether she is stable. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |

### Sounds

At the start the simulated heart sound is "afib" and the lung sound is "clear". These are synthesized approximations.

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Acute Decompensated Heart Failure (HF-301)

**Categories:** Heart Failure. **Chief complaints:** Shortness of breath, Leg swelling.

**Patient:** 72-year-old man with known heart failure (ejection fraction about 30%). For 3 days he has had worsening breathlessness, needs to sleep sitting up, and his legs are swollen. He ran out of his water pill a week ago.

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 108 /min |
| Blood pressure | 169/98 mmHg |
| SpO2 | 86 % |
| Respiratory rate | 30 /min |
| Temperature | 36.9 C |
| Rhythm | sinus |
| Starting severity | 0.55 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.55 |
| growthPerMin | 0.008 |
| oxygenRelief | 0.003 |
| nivRelief | 0.012 |
| furosemideRelief | 0.01 |
| nitroRelief | 0.006 |
| nitroDurationMin | 40 |
| nitroMinSbp | 110 |
| nitroSbpDrop | 15 |
| nitroHypotensionHarm | 0.08 |
| stableSeverity | 0.2 |
| stableSpo2 | 92 |
| spo2Boost.niv | 5 |
| spo2Boost.oxygen | 3 |
| improvingSeverity | 0.3 |
| harm.metoprolol | 0.12 |
| harm.diltiazem | 0.15 |
| harm.fluids | 0.12 |
| harm.pericardiocentesis | 0.08 |
| harm.cardioversion | 0.05 |
| harm.norepi | 0.08 |
| vitals.hr | [75, 60] |
| vitals.sbp | [185, -30] |
| vitals.dbp | [110, -22] |
| vitals.spo2 | [99, -24] |
| vitals.rr | [18, 22] |
| vitals.temp | [36.9, 0] |

### Rules

- Severity (0 to 1) rises by 0.008 per minute.
- Oxygen alone lowers that by 0.003 per minute. BiPAP lowers it by 0.012 (and replaces the oxygen effect). Furosemide lowers it by 0.01. Nitroglycerin lowers it by 0.006 for 40 minutes.
- BiPAP raises oxygen saturation by 5 points and oxygen alone by 3.
- Nitroglycerin is helpful when systolic pressure is 110 or higher. Below that it adds 0.08 to severity.
- IV metoprolol adds 0.12, diltiazem 0.15, a fluid bolus 0.12, pericardiocentesis 0.08, cardioversion 0.05 and norepinephrine 0.08 to severity.
- The patient stabilizes when severity is 0.2 or less and oxygen saturation is 92% or higher. The patient dies when severity reaches 1.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Oxygen by mask | helpful | no | Oxygen treats his low saturation while the cause is addressed. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Non-invasive ventilation (BiPAP) | helpful | no | BiPAP improves oxygenation and reduces the work of breathing in pulmonary edema. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Furosemide 40 mg IV | helpful | no | IV loop diuretic removes the excess fluid and is the main treatment for congestion. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Nitroglycerin sublingual | helpful | yes, see Parameters | Nitroglycerin lowers filling pressure and eases breathlessness when blood pressure is high. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Metoprolol IV | harmful | no | A beta-blocker weakens the heart further during acute decompensation. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Diltiazem IV | harmful | no | Diltiazem weakens heart contraction and is harmful when the ejection fraction is low. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| IV fluid bolus 500 mL | harmful | no | He is already overloaded with fluid, and more volume worsens the pulmonary edema. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Pericardiocentesis | harmful | no | There is no effusion to drain. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Synchronized cardioversion | harmful | no | He is in sinus rhythm, so a shock has no benefit. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Norepinephrine infusion | harmful | no | A vasopressor raises afterload in a patient whose blood pressure is already high. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Aspirin 325 mg, chewed | neutral | no | This is not an acute coronary syndrome. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Heparin IV (anticoagulation) | neutral | no | There is no anticoagulation indication. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Ticagrelor loading dose | neutral | no | There is no acute coronary syndrome. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Activate cath lab (primary PCI) | neutral | no | There is no ST elevation or coronary occlusion. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings at the start

| Exam | Finding |
| --- | --- |
| General inspection | Sitting bolt upright, using his neck muscles to breathe and speaking in short phrases. |
| Listen to the heart | Regular and fast at about 108/min. A third heart sound (gallop) and a soft murmur at the apex. |
| Listen to the lungs | Crackles up to the middle of both lungs. No wheeze. |
| Check neck veins (JVP) | Neck veins are raised, about 12 cm, and pressing on the liver raises them further. |
| Check pulses and perfusion | Warm hands and feet. Pitting swelling up to both knees. |

### Test results at the start

| Test | Result |
| --- | --- |
| 12-lead ECG | Sinus tachycardia 108/min with an old left bundle branch block. No new ST elevation. |
| Troponin | Troponin I 0.06 ng/mL, mildly raised, in a pattern of long-standing heart strain. |
| BNP | BNP 1,850 pg/mL, markedly raised. |
| Electrolytes and creatinine | Potassium 4.8, sodium 133, creatinine 1.6 mg/dL (his usual is 1.4). |
| Chest X-ray | Enlarged heart, haziness around both lung hila and Kerley B lines: pulmonary edema. |
| Bedside echocardiogram | Dilated left ventricle, ejection fraction about 25%, moderate functional mitral regurgitation, dilated IVC. No pericardial effusion. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The ECG excludes an acute heart attack as the trigger. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| BNP | BNP supports the diagnosis of heart failure. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Electrolytes and creatinine | Potassium and kidney function guide diuretic therapy. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Chest X-ray | The chest X-ray confirms pulmonary edema. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Bedside echocardiogram | Echocardiography shows the cause and heart function. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Listen to the lungs | Crackles show how congested the lungs are. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Check neck veins (JVP) | Neck veins show how much fluid he is holding. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 10 | 10 | It excludes an acute coronary trigger. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Support breathing (BiPAP or oxygen) | Non-invasive ventilation (BiPAP) or Oxygen by mask | 25 | 15 | His oxygen saturation is low. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Give IV furosemide | Furosemide 40 mg IV | 30 | 20 | A diuretic removes the excess fluid. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Give nitroglycerin while blood pressure is high | Nitroglycerin sublingual | 15 | 25 | It lowers filling pressure and eases breathing. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Check electrolytes and kidney function | Electrolytes and creatinine | 10 | 30 | It guides diuretic dosing. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Confirm with a chest X-ray, BNP or echocardiogram | Chest X-ray or BNP or Bedside echocardiogram | 10 | 30 | It confirms the diagnosis. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |

### Sounds

At the start the simulated heart sound is "s3" and the lung sound is "crackles". These are synthesized approximations.

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Cardiac Tamponade (PER-401)

**Categories:** Pericardial Disease. **Chief complaints:** Chest pain, Shortness of breath.

**Patient:** 45-year-old man with 3 days of worsening shortness of breath and chest discomfort that is easier when he leans forward. He recently had a viral illness. He is pale, sitting upright and very anxious.

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 130 /min |
| Blood pressure | 84/59 mmHg |
| SpO2 | 93 % |
| Respiratory rate | 27 /min |
| Temperature | 37.4 C |
| Rhythm | sinus |
| Starting severity | 0.45 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.45 |
| growthPerMin | 0.01 |
| drainedRatePerMin | -0.06 |
| stableSeverity | 0.2 |
| fluidRelief | 0.06 |
| fluidMaxEffective | 2 |
| lowVoltageAmp | 0.5 |
| harm.nitro | 0.12 |
| harm.furosemide | 0.1 |
| harm.metoprolol | 0.12 |
| harm.niv | 0.12 |
| harm.cardioversion | 0.04 |
| hrCap | 165 |
| vitals.hr | [85, 100] |
| vitals.sbp | [120, -80] |
| vitals.dbp | [86, -60] |
| vitals.spo2 | [99, -14] |
| vitals.rr | [14, 28] |
| vitals.temp | [37.4, 0] |

### Rules

- Severity (0 to 1) rises by 0.01 per minute until the fluid is drained. After pericardiocentesis it falls by 0.06 per minute.
- A fluid bolus lowers severity by 0.06, for the first two boluses only.
- Nitroglycerin adds 0.12, furosemide 0.1, IV metoprolol 0.12, non-invasive ventilation 0.12 and cardioversion 0.04 to severity.
- The ECG shows low voltage (half height) with electrical alternans until the fluid is drained.
- The patient stabilizes when the fluid is drained and severity is 0.2 or less. The patient dies when severity reaches 1.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Pericardiocentesis | helpful | no | Draining the fluid is the definitive treatment for tamponade that is causing shock. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| IV fluid bolus 500 mL | helpful | yes, see Parameters | A fluid bolus can briefly raise filling pressure and buy time before drainage. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Nitroglycerin sublingual | harmful | no | Nitrates lower preload, and the heart depends on its filling pressure in tamponade. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Furosemide 40 mg IV | harmful | no | A diuretic lowers filling pressure, which a heart in tamponade depends on. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Metoprolol IV | harmful | no | A beta-blocker blunts the fast heart rate that is keeping his output up. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Non-invasive ventilation (BiPAP) | harmful | no | Positive pressure reduces the blood returning to the heart and can cause collapse in tamponade. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Synchronized cardioversion | harmful | no | He is in sinus rhythm, so a shock has no benefit and adds risk. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Norepinephrine infusion | neutral | no | Vasopressors do not fix tamponade. The fluid has to be drained. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Oxygen by mask | neutral | no | Oxygen helps a little but does not treat the cause. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Aspirin 325 mg, chewed | neutral | no | This is not a heart attack. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Activate cath lab (primary PCI) | neutral | no | There is no coronary occlusion, so PCI does not help. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings at the start

| Exam | Finding |
| --- | --- |
| General inspection | Pale, sweaty and anxious, sitting upright and breathing fast. |
| Listen to the heart | Distant, muffled heart sounds, fast at about 130/min. |
| Listen to the lungs | Clear on both sides. |
| Check neck veins (JVP) | Neck veins are markedly raised, about 14 cm, and do not fall when he breathes in. |
| Check pulses and perfusion | Fast, thin pulses. The systolic pressure falls by about 15 mmHg when he breathes in (pulsus paradoxus). |

### Test results at the start

| Test | Result |
| --- | --- |
| 12-lead ECG | Sinus tachycardia 130/min. Low voltage QRS complexes with electrical alternans (the QRS height alternates beat to beat). |
| Troponin | Troponin I below 0.04 ng/mL (normal). |
| BNP | BNP 80 pg/mL, normal. |
| Electrolytes and creatinine | Potassium 4.4, creatinine 1.3 mg/dL, slightly high from poor perfusion. |
| Chest X-ray | Enlarged, globe-shaped heart outline. Clear lung fields. |
| Bedside echocardiogram | Large circumferential pericardial effusion (about 2.5 cm) with the right atrium and right ventricle collapsing in diastole. Dilated IVC that does not collapse. Tamponade physiology. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| Bedside echocardiogram | Bedside echocardiography confirms the effusion and tamponade physiology. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| 12-lead ECG | Low voltage and electrical alternans support the diagnosis. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Listen to the heart | Muffled heart sounds are part of the classic picture. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Check neck veins (JVP) | Raised neck veins are part of the classic picture (Beck triad). | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Check pulses and perfusion | Pulsus paradoxus points to tamponade. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a bedside echocardiogram | Bedside echocardiogram | 30 | 15 | It confirms the effusion and shows tamponade. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Drain the fluid (pericardiocentesis) | Pericardiocentesis | 40 | 30 | Draining the fluid is the definitive treatment. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Examine for muffled sounds, raised neck veins or pulsus paradoxus | Listen to the heart or Check neck veins (JVP) or Check pulses and perfusion | 10 | 10 | The bedside signs point to the diagnosis. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Give a fluid bolus to buy time | IV fluid bolus 500 mL | 10 | 20 | Temporizing fluid can help until the fluid is drained. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Get a 12-lead ECG | 12-lead ECG | 10 | 15 | It shows low voltage and alternans. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |

### Sounds

At the start the simulated heart sound is "muffled" and the lung sound is "clear". These are synthesized approximations.

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)
