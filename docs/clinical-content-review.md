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
| Start chest compressions (CPR) | treat | 1 |
| Defibrillate (unsynchronized shock) | treat | 1 |
| Epinephrine IV | treat | 1 |
| Amiodarone IV | treat | 3 |
| Adenosine rapid IV push | treat | 2 |
| Vagal maneuver (modified Valsalva) | treat | 2 |
| Labetalol IV | treat | 3 |
| Nicardipine IV infusion | treat | 3 |
| Dobutamine infusion | treat | 3 |
| Ask a question | history | 1 |

## History taking

The learner types a question or picks a suggested one. The question is matched to a topic by its words, tried in this order so the more specific topic wins. A question that matches no topic gets the polite "not sure" answer and costs no time. Each question that is understood costs 1 minute in learning mode.

| Topic | Suggested question |
| --- | --- |
| collapse | Did anyone see what happened? |
| adherence | Have you missed any medicines? |
| allergies | Do you have any allergies? |
| meds | What medicines do you take? |
| family | Does heart disease run in your family? |
| pmh | Do you have any medical conditions? |
| lastmeal | When did you last eat or drink? |
| social | Do you smoke, drink or use drugs? |
| syncope | Have you fainted or felt dizzy? |
| headache | Do you have a headache? |
| vision | Is your vision affected? |
| neuro | Any weakness, numbness or trouble speaking? |
| palpitations | Can you feel your heart racing? |
| sweating | Are you sweaty or clammy? |
| nausea | Do you feel sick or have you vomited? |
| breathless | Are you short of breath? |
| swelling | Are your legs or ankles swollen? |
| infection | Have you been unwell recently? |
| prior | Has this happened before? |
| severity | How bad is it, out of 10? |
| radiation | Does it spread anywhere? |
| provoking | What makes it better or worse? |
| quality | What does it feel like? |
| location | Where is the pain? |
| onset | When did it start? |
| complaint | What is wrong? |

Topics a case does not answer fall back to "No, not that I have noticed." for symptoms and "Nothing that I know of." for past history. A question that is not understood gets: "Sorry, I am not sure what you are asking. Could you ask it another way?"

## Monitor alarms and nurse call-outs

The bedside monitor raises an alarm when a vital sign passes a limit. The nurse says one line when an alarm starts.

| Alarm | Limit | Urgent when | Nurse says |
| --- | --- | --- | --- |
| Heart rate high | above 120/min | above 150/min | Heart rate is N. |
| Heart rate low | below 50/min | below 40/min | Heart rate has dropped to N. |
| Blood pressure low | systolic below 90 mmHg | systolic below 80 mmHg | Pressure is N over N. |
| Oxygen low | SpO2 below 90% | SpO2 below 85% | Sats are down to N%. |
| Breathing rate high | above 28/min | never urgent | Breathing at N. |

Vital-sign flags on the monitor tiles: heart rate Low below 60 and High above 100; systolic pressure Low below 90 and High at 140 or more; SpO2 Low below 92%; breathing rate Low below 12 and High above 20; temperature Low below 36 and High above 38.

## 12-lead ECG morphology

Each lead is built from P, Q, R, S and T waves (heights in mV; 1 mV is 10 mm on the paper), a J-point ST offset and a PR-segment offset. The printout shows 10 seconds at 25 mm/s and 10 mm/mV. Leads are drawn in the usual four columns of three, with a lead II rhythm strip.

Normal values for each lead:

| Lead | P | Q | R | S | T | ST | PR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I | 0.1 | -0.05 | 0.6 | -0.1 | 0.2 | 0 | 0 |
| II | 0.15 | -0.05 | 1 | -0.15 | 0.3 | 0 | 0 |
| III | 0.08 | -0.1 | 0.5 | -0.1 | 0.15 | 0 | 0 |
| aVR | -0.12 | 0 | 0.1 | -0.8 | -0.25 | 0 | 0 |
| aVL | 0.05 | -0.05 | 0.35 | -0.2 | 0.1 | 0 | 0 |
| aVF | 0.12 | -0.05 | 0.75 | -0.1 | 0.25 | 0 | 0 |
| V1 | 0.05 | 0 | 0.25 | -1 | 0 | 0 | 0 |
| V2 | 0.06 | 0 | 0.5 | -1.1 | 0.3 | 0 | 0 |
| V3 | 0.08 | 0 | 0.8 | -0.8 | 0.35 | 0 | 0 |
| V4 | 0.1 | -0.05 | 1.1 | -0.4 | 0.4 | 0 | 0 |
| V5 | 0.1 | -0.05 | 1.1 | -0.15 | 0.35 | 0 | 0 |
| V6 | 0.1 | -0.05 | 0.9 | -0.05 | 0.3 | 0 | 0 |

### ECG pattern: normal

Normal morphology

QRS width factor: 1.

### ECG pattern: anterior-stemi

Anterior STEMI: ST elevation V1 to V4 with tall T waves in V2 and V3, mild ST elevation in I and aVL, reciprocal ST depression in II, III and aVF

QRS width factor: 1.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| V1 | st 0.2 |
| V2 | st 0.4, t 0.55 |
| V3 | st 0.4, t 0.55 |
| V4 | st 0.3 |
| V5 | st 0.1 |
| I | st 0.1 |
| aVL | st 0.15 |
| II | st -0.1 |
| III | st -0.15 |
| aVF | st -0.12 |

### ECG pattern: anterior-stemi-reperfused

Anterior STEMI after reperfusion: ST elevation falling and T waves inverting in V1 to V4

QRS width factor: 1.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| V1 | st 0.05, t -0.1 |
| V2 | st 0.08, t -0.25 |
| V3 | st 0.08, t -0.3 |
| V4 | st 0.05, t -0.25 |

### ECG pattern: low-voltage

Low voltage: all complexes about half height (set by the case), with electrical alternans

QRS width factor: 1.

### ECG pattern: pericarditis

Pericarditis: diffuse ST elevation with PR segment depression, and the opposite in aVR

QRS width factor: 1.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| I | st 0.1, pr -0.05 |
| II | st 0.12, pr -0.06 |
| III | st 0.05, pr -0.04 |
| aVF | st 0.1, pr -0.05 |
| aVR | st -0.12, pr 0.06 |
| V2 | st 0.12, pr -0.04 |
| V3 | st 0.12, pr -0.05 |
| V4 | st 0.12, pr -0.05 |
| V5 | st 0.12, pr -0.05 |
| V6 | st 0.12, pr -0.05 |

### ECG pattern: svt

Supraventricular tachycardia: fast and regular with narrow complexes, no visible P waves, and mild ST depression in the inferior and lateral leads

QRS width factor: 1.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| II | st -0.08 |
| III | st -0.08 |
| aVF | st -0.08 |
| V4 | st -0.1 |
| V5 | st -0.12 |
| V6 | st -0.1 |

### ECG pattern: vt

Ventricular tachycardia: fast, regular, very wide complexes with no P waves, deep S waves in V1 to V3 and broad R waves in V5, V6, I and aVL, with discordant ST and T waves

QRS width factor: 3.2.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| V1 | r 0.1, s -1.8, st 0.3, t 0.5 |
| V2 | r 0.1, s -2, st 0.35, t 0.5 |
| V3 | r 0.2, s -1.5, st 0.25, t 0.4 |
| V4 | r 0.5, s -0.8, st 0, t 0.1 |
| V5 | q 0, r 1.3, s 0, st -0.2, t -0.5 |
| V6 | q 0, r 1.2, s 0, st -0.2, t -0.5 |
| I | q 0, r 0.9, s 0, st -0.15, t -0.4 |
| aVL | q 0, r 0.8, s 0, st -0.15, t -0.4 |
| II | r 0.7, s -0.3, st 0.05, t 0.3 |
| III | r 0.4, s -0.6, st 0.1, t 0.3 |
| aVF | r 0.5, s -0.4, st 0.08, t 0.3 |
| aVR | r 0, s -1.1, st 0.1, t 0.3 |

### ECG pattern: lvh-strain

Left ventricular hypertrophy with strain: very tall R waves in V5 and V6 and deep S waves in V1 and V2, with ST depression and inverted T waves in the lateral leads

QRS width factor: 1.15.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| V1 | r 0.1, s -1.7, t 0.2 |
| V2 | r 0.3, s -2.2, t 0.4 |
| V3 | r 0.8, s -1.4 |
| V4 | r 1.6, s -0.4 |
| V5 | r 2.4, s -0.1, st -0.15, t -0.35 |
| V6 | r 2, s 0, st -0.15, t -0.3 |
| I | r 1, st -0.1, t -0.2 |
| aVL | r 1.1, st -0.12, t -0.25 |

### ECG pattern: lbbb

Left bundle branch block: wide QRS, deep S or QS waves in V1 to V3 with ST elevation, broad R waves in I, aVL, V5 and V6 with ST depression and inverted T waves

QRS width factor: 2.2.

| Lead | Values that differ from normal (mV) |
| --- | --- |
| V1 | r 0.05, s -1.3, st 0.25, t 0.35 |
| V2 | r 0.05, s -1.6, st 0.3, t 0.4 |
| V3 | r 0.1, s -1.2, st 0.2, t 0.3 |
| V4 | r 0.4, s -0.6, st 0, t 0.1 |
| V5 | q 0, r 1.1, s 0, st -0.12, t -0.3 |
| V6 | q 0, r 1, s 0, st -0.15, t -0.3 |
| I | q 0, r 0.9, s 0, st -0.1, t -0.3 |
| aVL | q 0, r 0.7, s 0, st -0.15, t -0.3 |
| II | r 0.7, s -0.1, st 0.05, t 0.2 |
| III | r 0.3, s -0.5, st 0.1, t 0.2 |
| aVF | r 0.5, s -0.3, st 0.08, t 0.2 |
| aVR | r 0, s -0.9, st 0.1, t 0.2 |

## Anterior STEMI (ACS-101)

**Categories:** Acute Coronary Syndrome. **Chief complaints:** Chest pain.

**Patient:** 58-year-old man with 45 minutes of crushing central chest pain spreading to the left arm. He smokes and has high blood pressure. He arrived by ambulance and is sweaty and anxious.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 58-year-old man |
| Bay | 9 |
| Triage | level 2: Emergent |
| Posture | reclined |
| Handover | Paramedic handover: 58-year-old man with 45 minutes of crushing central chest pain that began while he carried shopping upstairs. He smokes and is treated for high blood pressure (amlodipine). No known allergies. He has not taken any aspirin. Pain 8 out of 10, sweaty and nauseated. |

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
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
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

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Anxious, pale and sweaty, clutching his chest. | after a combination of treatments, minute 18 |
| General inspection | Grey, drenched in sweat, drowsy and in severe distress. | after a combination of treatments, minute 35 |
| General inspection | Still pale and sweaty, but less restless. The pain has eased a little since the nitroglycerin. | after a combination of treatments, minute 9 |
| General inspection | Comfortable, pain-free, no longer sweating. He is talking easily. | after a combination of treatments, minute 69 |
| Listen to the heart | Regular rhythm at about 98/min. Normal first and second sounds, a soft fourth sound, no murmur. | after a combination of treatments, minute 18 |
| Listen to the heart | Fast at about 127/min. A third heart sound (gallop) has appeared on top of the fourth sound. | after a combination of treatments, minute 35 |
| Listen to the heart | Regular at about 118/min. The fourth sound is fainter and there is no murmur. | after a combination of treatments, minute 69 |
| Listen to the lungs | Clear on both sides. | after a combination of treatments, minute 18 |
| Listen to the lungs | Crackles at both lung bases. | after a combination of treatments, minute 35 |
| Listen to the lungs | Fine crackles at both bases after the fluid bolus. | after a combination of treatments, minute 32 |
| Check neck veins (JVP) | Neck veins are not raised. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins are raised, about 8 cm. | after a combination of treatments, minute 35 |
| Check pulses and perfusion | Pulses strong and equal in both arms. Warm hands. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Weak, fast pulses. Cold, clammy hands and feet. | after a combination of treatments, minute 35 |
| Check pulses and perfusion | Pulses strong and equal. His blood pressure is lower since the nitroglycerin. | after a combination of treatments, minute 9 |
| Check pulses and perfusion | Strong, regular pulses. Warm hands and feet. | after a combination of treatments, minute 69 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Sinus rhythm 98/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Anterior STEMI. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus rhythm 127/min. ST elevation of 3 to 4 mm in V1 to V4 with reciprocal ST depression in II, III and aVF. Q waves are starting to form in V1 to V3. Anterior STEMI. | after a combination of treatments, minute 35 |
| 12-lead ECG | Sinus rhythm 118/min. ST elevation in V1 to V4 is falling, with new T wave inversion. Reperfusion pattern. | after a combination of treatments, minute 69 |
| Troponin | Troponin I 1.02 ng/mL (normal below 0.04), rising with the time since the pain began. | after a combination of treatments, minute 18 |
| Troponin | Troponin I 1.8 ng/mL (normal below 0.04). Still rising after reperfusion, and it should peak within hours. | after a combination of treatments, minute 69 |
| BNP | BNP 210 pg/mL, mildly raised. | after a combination of treatments, minute 18 |
| BNP | BNP 640 pg/mL, rising: the left ventricle is struggling. | after a combination of treatments, minute 35 |
| BNP | BNP 420 pg/mL, higher after the fluid bolus. | after a combination of treatments, minute 32 |
| BNP | BNP 230 pg/mL, mildly raised. It falls over days, not minutes. | after a combination of treatments, minute 69 |
| Electrolytes and creatinine | Potassium 4.1, sodium 139, creatinine 1.0 mg/dL, glucose 128 mg/dL. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 4.4, bicarbonate 19 (low), creatinine 1.3 mg/dL. Lactate 3.1 mmol/L (raised). | after a combination of treatments, minute 35 |
| Electrolytes and creatinine | Potassium 4.0, sodium 139, creatinine 1.0 mg/dL. Creatinine will be repeated in 24 hours because of the contrast dye. | after a combination of treatments, minute 69 |
| Chest X-ray | Normal heart size. Clear lung fields. | after a combination of treatments, minute 18 |
| Chest X-ray | Normal heart size. Pulmonary edema is developing. | after a combination of treatments, minute 35 |
| Chest X-ray | Normal heart size. Early vascular congestion after the fluid bolus. | after a combination of treatments, minute 32 |
| Bedside echocardiogram | Anterior wall and apex barely move. Estimated ejection fraction about 40%. No pericardial effusion. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Anterior wall and apex still move poorly after reperfusion. Estimated ejection fraction about 40%. No pericardial effusion. | after a combination of treatments, minute 69 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Examination: Listen to the lungs | The lungs are clear at the start and stay clear when he is treated correctly. They change only if fluid harms him or he gets much worse. |
| Examination: Check neck veins (JVP) | The neck veins are not raised at the start and stay flat when he is treated correctly. They rise only if fluid harms him or he gets much worse. |
| Test: Chest X-ray | The chest X-ray is clear at the start and after correct treatment. It shows congestion only if fluid harms him or he gets much worse. |
| Listening site: heart aortic | Nothing is heard at the aortic area in any state of this case: the murmur of a ruptured papillary muscle is heard at the apex. |
| Listening site: heart pulmonic | Nothing is heard at the pulmonic area in any state of this case: the abnormal sounds are heard at the apex. |
| Listening site: heart tricuspid | Nothing is heard at the lower left sternal edge in any state of this case: the abnormal sounds are heard at the apex. |
| Listening site: lungs upper | The lungs are clear at the start and stay clear when he is treated correctly. They change only if fluid harms him or he gets much worse. |
| Listening site: lungs lower | The lungs are clear at the start and stay clear when he is treated correctly. They change only if fluid harms him or he gets much worse. |

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

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | I have a crushing pain in the middle of my chest. | after a combination of treatments, minute 18 |
| onset | About 45 minutes ago. I was carrying shopping up the stairs. | after a combination of treatments, minute 18 |
| severity | 8 out of 10. | after a combination of treatments, minute 18 |
| severity | It is down to a 2 out of 10 now. | after a combination of treatments, minute 69 |
| location | Right in the middle of my chest, behind the breastbone. | after a combination of treatments, minute 18 |
| quality | Like a heavy weight, or a tight band squeezing me. | after a combination of treatments, minute 18 |
| radiation | It goes into my left arm and my jaw. | after a combination of treatments, minute 18 |
| provoking | It came on with the stairs. It has not eased with rest. | after a combination of treatments, minute 18 |
| sweating | Yes, I am drenched. | after a combination of treatments, minute 18 |
| nausea | I feel sick, but I have not vomited. | after a combination of treatments, minute 18 |
| breathless | A little. I cannot take a deep breath. | after a combination of treatments, minute 18 |
| syncope | No, but I feel faint. | after a combination of treatments, minute 18 |
| prior | I get a tightness on stairs sometimes, but never like this. | after a combination of treatments, minute 18 |
| pmh | High blood pressure and high cholesterol. No heart problems that I know of. | after a combination of treatments, minute 18 |
| meds | Amlodipine for my blood pressure. Nothing else. | after a combination of treatments, minute 18 |
| adherence | I take them most days. | after a combination of treatments, minute 18 |
| allergies | None that I know of. | after a combination of treatments, minute 18 |
| family | My father had a heart attack at 55. | after a combination of treatments, minute 18 |
| social | I smoke 20 a day. A few beers at the weekend. No drugs. | after a combination of treatments, minute 18 |
| lastmeal | Breakfast, about four hours ago. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Normal first and second sounds. No murmur at the aortic area. | after a combination of treatments, minute 18 |
| heart: pulmonic | Normal first and second sounds. No murmur at the pulmonic area. | after a combination of treatments, minute 18 |
| heart: tricuspid | Normal sounds. No murmur at the lower left sternal edge. | after a combination of treatments, minute 18 |
| heart: mitral | At the apex there is a soft fourth sound. No murmur. | after a combination of treatments, minute 18 |
| heart: mitral | A third heart sound and a new holosystolic murmur at the apex: the papillary muscle is ischemic. | after a combination of treatments, minute 35 |
| heart: mitral | At the apex there is a faint fourth sound. No murmur. | after a combination of treatments, minute 69 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 18 |
| lungs: upper | Fine crackles are heard in the upper zones. | after a combination of treatments, minute 35 |
| lungs: lower | Clear at the bases. | after a combination of treatments, minute 18 |
| lungs: lower | Crackles at the bases. | after a combination of treatments, minute 35 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| It feels like an elephant is sitting on my chest. | after a combination of treatments, minute 18 |
| The pressure is getting worse. I feel sick. | after a combination of treatments, minute 25 |
| I feel like I am going to pass out. | after a combination of treatments, minute 35 |
| The pain is much better. Thank you. | after a combination of treatments, minute 69 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.4 | 1 | 1 | 1 | 0 | false | false | anterior-apex | Anterior wall and apex barely move. Estimated ejection fraction about 40%. No pericardial effusion. | after a combination of treatments, minute 18 |
| 0.4 | 1 | 1 | 1 | 0 | false | false | anterior-apex | Anterior wall and apex still move poorly after reperfusion. Estimated ejection fraction about 40%. No pericardial effusion. | after a combination of treatments, minute 69 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: yes | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: no | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: no | after a combination of treatments, minute 18 |
| distressed face: no | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| distressed face: yes | after a combination of treatments, minute 25 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| labored breathing: yes | after a combination of treatments, minute 35 |
| sweating: no | after a combination of treatments, minute 59 |
| oxygen mask: o2 | after a combination of treatments, minute 59 |
| died: yes | after a combination of treatments, minute 59 |
| oxygen mask: niv | after a combination of treatments, minute 63 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| anterior-stemi | after a combination of treatments, minute 18 |
| anterior-stemi-reperfused | after a combination of treatments, minute 69 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the aortic site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the pulmonic site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the tricuspid site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the mitral site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the upper site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |
| at the lower site: heart: normal, lungs: crackles | after a combination of treatments, minute 35 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Atrial Fibrillation with RVR (ARR-201)

**Categories:** Arrhythmia. **Chief complaints:** Palpitations.

**Patient:** 68-year-old woman with 6 hours of a racing, uneven heartbeat and mild light-headedness. She has high blood pressure. She is awake, talking and comfortable at rest.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 68-year-old woman |
| Bay | 8 |
| Triage | level 3: Urgent |
| Posture | reclined |
| Handover | Paramedic handover: 68-year-old woman with 6 hours of a fast, uneven heartbeat and mild light-headedness. No chest pain. She has high blood pressure (ramipril) and takes no blood thinners. No known allergies. She walked to the ambulance. |

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
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation |
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

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Anxious and a little short of breath, but comfortable at rest and speaking in full sentences. | after a combination of treatments, minute 18 |
| General inspection | Pale, sweaty and drowsy. She is short of breath and cannot finish a sentence. | after a combination of treatments, minute 35 |
| General inspection | Calmer, with the racing eased. She is comfortable at rest. | after a combination of treatments, minute 9 |
| General inspection | Awake, but with a right facial droop, a weak right arm and slurred speech. | after a combination of treatments, minute 17 |
| General inspection | Calm and comfortable. She says her heart feels normal again. | after a combination of treatments, minute 86 |
| Listen to the heart | Irregularly irregular and fast, about 160/min. No murmur. | after a combination of treatments, minute 18 |
| Listen to the heart | Still irregularly irregular, but slower, about 101/min. No murmur. | after a combination of treatments, minute 9 |
| Listen to the heart | Regular rhythm at about 88/min. No murmur. | after a combination of treatments, minute 17 |
| Listen to the lungs | Clear on both sides. | after a combination of treatments, minute 18 |
| Listen to the lungs | Fine crackles at both bases from the strain of the fast rate. | after a combination of treatments, minute 35 |
| Check neck veins (JVP) | Neck veins are not raised. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins are mildly raised. | after a combination of treatments, minute 35 |
| Check pulses and perfusion | Irregular pulse. The radial pulse is slower than the heartbeat heard at the chest (pulse deficit). | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Irregular, but slower. The pulse deficit is smaller. | after a combination of treatments, minute 9 |
| Check pulses and perfusion | Regular pulse, equal in both arms. | after a combination of treatments, minute 17 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Irregularly irregular rhythm with no P waves. Ventricular rate 160/min, narrow QRS. Atrial fibrillation with rapid ventricular response. | after a combination of treatments, minute 18 |
| 12-lead ECG | Atrial fibrillation with a controlled ventricular rate of 101/min. Narrow QRS. | after a combination of treatments, minute 9 |
| 12-lead ECG | Sinus rhythm 88/min. Narrow QRS. No acute ST changes. | after a combination of treatments, minute 17 |
| Troponin | Troponin I below 0.04 ng/mL (normal). | after a combination of treatments, minute 18 |
| BNP | BNP 140 pg/mL, slightly raised for her age. | after a combination of treatments, minute 18 |
| BNP | BNP 420 pg/mL, raised by the strain of the fast rate. | after a combination of treatments, minute 35 |
| Electrolytes and creatinine | Potassium 3.6, magnesium 1.7 (low-normal), creatinine 0.9 mg/dL. | after a combination of treatments, minute 18 |
| Chest X-ray | Normal heart size. Clear lung fields. | after a combination of treatments, minute 18 |
| Chest X-ray | Normal heart size. Early congestion at the lung bases. | after a combination of treatments, minute 35 |
| Bedside echocardiogram | Ejection fraction about 55%. Mildly enlarged left atrium. No pericardial effusion. Bedside views cannot rule out a clot in the left atrial appendage. | after a combination of treatments, minute 18 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Examination: Listen to the lungs | The lungs are clear at the start and after correct treatment. This stays the same when she is treated correctly. It changes only if she gets much worse. |
| Examination: Check neck veins (JVP) | The neck veins are not raised at the start and after correct treatment. This stays the same when she is treated correctly. It changes only if she gets much worse. |
| Test: Troponin | Troponin is normal at the start and stays normal: this is a rhythm problem, not a heart attack. |
| Test: BNP | BNP is only slightly raised and does not move in minutes. It rises only if the fast rate pushes her into heart failure. |
| Test: Electrolytes and creatinine | Nothing the learner can give replaces potassium or magnesium, so the electrolytes stay as they were. |
| Test: Chest X-ray | The chest X-ray is normal at the start and after correct treatment. This stays the same when she is treated correctly. It changes only if she gets much worse. |
| Test: Bedside echocardiogram | The heart muscle and valves are normal and do not change in minutes. Only the rhythm changes. |
| Listening site: lungs upper | The upper lungs are clear at the start and after correct treatment. This stays the same when she is treated correctly. It changes only if she gets much worse. |
| Listening site: lungs lower | The lung bases are clear at the start and after correct treatment. This stays the same when she is treated correctly. It changes only if she gets much worse. |

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

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | My heart is racing and it feels uneven. | after a combination of treatments, minute 18 |
| onset | About six hours ago, while I was making breakfast. | after a combination of treatments, minute 18 |
| severity | It is not painful. It is just uncomfortable, and I feel dizzy. | after a combination of treatments, minute 18 |
| location | It is in my chest. A fluttering feeling. | after a combination of treatments, minute 18 |
| palpitations | Yes, it is racing and skipping. | after a combination of treatments, minute 18 |
| syncope | I feel light-headed, but I have not fainted. | after a combination of treatments, minute 18 |
| breathless | A little, when I walk. | after a combination of treatments, minute 18 |
| prior | It has never happened before. | after a combination of treatments, minute 18 |
| neuro | No weakness or numbness. | after a combination of treatments, minute 18 |
| neuro | My right arm will not move and I cannot find the words. | after a combination of treatments, minute 17 |
| pmh | High blood pressure. | after a combination of treatments, minute 18 |
| meds | Ramipril. No blood thinners. | after a combination of treatments, minute 18 |
| adherence | I take it every morning. | after a combination of treatments, minute 18 |
| allergies | None that I know of. | after a combination of treatments, minute 18 |
| family | My sister has an irregular heartbeat. | after a combination of treatments, minute 18 |
| social | A glass of wine most evenings, and about four coffees a day. I do not smoke. | after a combination of treatments, minute 18 |
| lastmeal | Tea and toast this morning. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Fast and irregular. No murmur at the aortic area. | after a combination of treatments, minute 18 |
| heart: aortic | Irregular, but slower. No murmur at the aortic area. | after a combination of treatments, minute 9 |
| heart: aortic | Regular. No murmur at the aortic area. | after a combination of treatments, minute 17 |
| heart: pulmonic | Fast and irregular. No murmur at the pulmonic area. | after a combination of treatments, minute 18 |
| heart: pulmonic | Irregular, but slower. No murmur at the pulmonic area. | after a combination of treatments, minute 9 |
| heart: pulmonic | Regular. No murmur at the pulmonic area. | after a combination of treatments, minute 17 |
| heart: tricuspid | Fast and irregular. No murmur at the lower left sternal edge. | after a combination of treatments, minute 18 |
| heart: tricuspid | Irregular, but slower. No murmur at the lower left sternal edge. | after a combination of treatments, minute 9 |
| heart: tricuspid | Regular. No murmur at the lower left sternal edge. | after a combination of treatments, minute 17 |
| heart: mitral | Irregularly irregular and fast at the apex. The first sound changes in loudness from beat to beat. No murmur. | after a combination of treatments, minute 18 |
| heart: mitral | Irregularly irregular, but slower, at the apex. The first sound still changes in loudness. No murmur. | after a combination of treatments, minute 9 |
| heart: mitral | Regular rhythm. No murmur at the apex. | after a combination of treatments, minute 17 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 18 |
| lungs: upper | Fine crackles in the upper zones. | after a combination of treatments, minute 35 |
| lungs: lower | Clear at the bases. | after a combination of treatments, minute 18 |
| lungs: lower | Crackles at the bases. | after a combination of treatments, minute 35 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| My heart is racing and fluttering. I feel a bit dizzy. | after a combination of treatments, minute 18 |
| I feel faint. Everything is going grey. | after a combination of treatments, minute 35 |
| My right arm will not move, and the words will not come out. | after a combination of treatments, minute 17 |
| My heart feels normal again. | after a combination of treatments, minute 86 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.55 | 1 | 1.35 | 1 | 0 | false | false | none | Ejection fraction about 55%. Mildly enlarged left atrium. No pericardial effusion. Bedside views cannot rule out a clot in the left atrial appendage. | after a combination of treatments, minute 18 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: no | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: no | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: no | after a combination of treatments, minute 18 |
| distressed face: no | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| distressed face: yes | after a combination of treatments, minute 19 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| labored breathing: yes | after a combination of treatments, minute 35 |
| oxygen mask: o2 | after a combination of treatments, minute 62 |
| died: yes | after a combination of treatments, minute 69 |
| oxygen mask: niv | after a combination of treatments, minute 63 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| normal | after a combination of treatments, minute 18 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the aortic site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the mitral site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the upper site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| at the lower site: heart: afib, lungs: clear | after a combination of treatments, minute 18 |
| heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 17 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Acute Decompensated Heart Failure (HF-301)

**Categories:** Heart Failure. **Chief complaints:** Shortness of breath, Leg swelling.

**Patient:** 72-year-old man with known heart failure (ejection fraction about 30%). For 3 days he has had worsening breathlessness, needs to sleep sitting up, and his legs are swollen. He ran out of his water pill a week ago.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 72-year-old man |
| Bay | 5 |
| Triage | level 2: Emergent |
| Posture | upright |
| Handover | Paramedic handover: 72-year-old man with known heart failure. Three days of worsening breathlessness, sleeping on three pillows, swollen legs. He ran out of his water pill (furosemide) a week ago. Oxygen saturation 84% on air. No known allergies. |

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
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure |
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

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Sitting bolt upright, using his neck muscles to breathe and speaking in short phrases. | after a combination of treatments, minute 18 |
| General inspection | Exhausted and gasping, drowsy, with blue lips and pink frothy sputum. | after a combination of treatments, minute 25 |
| General inspection | On oxygen, still using his neck muscles to breathe and speaking in short phrases. | after a combination of treatments, minute 47 |
| General inspection | Sitting up, breathing comfortably and speaking in full sentences. | after a combination of treatments, minute 63 |
| General inspection | On BiPAP, still sitting up but breathing more easily and speaking in short sentences. | after a combination of treatments, minute 2 |
| General inspection | Gasping and using every neck muscle, with pink frothy sputum. The fluid has made the pulmonary edema worse. | after a combination of treatments, minute 48 |
| Listen to the heart | Regular and fast at about 115/min. A third heart sound (gallop) and a soft murmur at the apex. | after a combination of treatments, minute 18 |
| Listen to the heart | Very fast at about 121/min. A loud gallop and a louder murmur at the apex. | after a combination of treatments, minute 25 |
| Listen to the heart | Regular at about 95/min. The third heart sound is softer and the murmur is quieter. | after a combination of treatments, minute 63 |
| Listen to the lungs | Crackles up to the middle of both lungs. No wheeze. | after a combination of treatments, minute 18 |
| Listen to the lungs | Crackles to the top of both lungs, with wheeze. | after a combination of treatments, minute 25 |
| Listen to the lungs | The crackles are retreating: now heard in the lower two thirds of both lungs. | after a combination of treatments, minute 13 |
| Listen to the lungs | Fine crackles at the bases only. | after a combination of treatments, minute 63 |
| Listen to the lungs | Crackles in the mid-zones of both lungs, with better air entry on BiPAP. | after a combination of treatments, minute 2 |
| Check neck veins (JVP) | Neck veins are raised, about 12 cm, and pressing on the liver raises them further. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins are very full, about 15 cm, and visibly pulsating. | after a combination of treatments, minute 25 |
| Check neck veins (JVP) | Neck veins are lower, about 9 cm, and pressing on the liver raises them less. | after a combination of treatments, minute 13 |
| Check neck veins (JVP) | Neck veins are only slightly raised, about 6 cm. | after a combination of treatments, minute 63 |
| Check pulses and perfusion | Warm hands and feet. Pitting swelling up to both knees. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Fast, thready pulses. The hands and feet are cool now. Pitting swelling up to both knees. | after a combination of treatments, minute 25 |
| Check pulses and perfusion | Warm hands and feet. The swelling is a little less, pitting up to the shins. | after a combination of treatments, minute 13 |
| Check pulses and perfusion | Warm hands and feet. The swelling has gone down to the ankles. | after a combination of treatments, minute 63 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Sinus tachycardia 115/min with an old left bundle branch block. No new ST elevation. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus rhythm 95/min with an old left bundle branch block. No new ST elevation. | after a combination of treatments, minute 63 |
| Troponin | Troponin I 0.06 ng/mL, mildly raised, in a pattern of long-standing heart strain. | after a combination of treatments, minute 18 |
| BNP | BNP 1,850 pg/mL, markedly raised. | after a combination of treatments, minute 18 |
| BNP | BNP 2,600 pg/mL, rising. | after a combination of treatments, minute 25 |
| BNP | BNP 1,850 pg/mL, still markedly raised. It falls over days, not minutes. | after a combination of treatments, minute 13 |
| Electrolytes and creatinine | Potassium 4.8, sodium 133, creatinine 1.6 mg/dL (his usual is 1.4). | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 3.9 (falling after the diuretic), sodium 134, creatinine 1.7 mg/dL (his usual is 1.4). | after a combination of treatments, minute 13 |
| Chest X-ray | Enlarged heart, haziness around both lung hila and Kerley B lines: pulmonary edema. | after a combination of treatments, minute 18 |
| Chest X-ray | Enlarged heart with florid pulmonary edema: both lungs are white, in a bat-wing pattern. | after a combination of treatments, minute 25 |
| Chest X-ray | Enlarged heart. The edema is still present but the haziness is lessening. | after a combination of treatments, minute 13 |
| Chest X-ray | Enlarged heart. Pulmonary edema is clearing. | after a combination of treatments, minute 63 |
| Chest X-ray | Enlarged heart with worse pulmonary edema: new haziness since the fluid bolus. | after a combination of treatments, minute 48 |
| Bedside echocardiogram | Dilated left ventricle with ejection fraction about 25%. Moderate functional mitral regurgitation. No pericardial effusion. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is lessening and the inferior vena cava is less dilated. No pericardial effusion. | after a combination of treatments, minute 13 |
| Bedside echocardiogram | Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is now mild and the inferior vena cava collapses with breathing. No pericardial effusion. | after a combination of treatments, minute 63 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Test: Troponin | The troponin leak is long-standing heart strain, not a new injury, so it does not change as the lungs clear. |

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

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | I cannot breathe properly, and my legs are swollen. | after a combination of treatments, minute 18 |
| onset | It has crept up over three days. | after a combination of treatments, minute 18 |
| severity | The breathlessness is a 9 out of 10. | after a combination of treatments, minute 18 |
| severity | The breathlessness is a 3 out of 10 now. | after a combination of treatments, minute 63 |
| breathless | Yes. I cannot lie flat. I sleep on three pillows and wake up gasping. | after a combination of treatments, minute 18 |
| swelling | Yes, up to my knees. | after a combination of treatments, minute 18 |
| palpitations | My heart is going fast, but it is regular. | after a combination of treatments, minute 18 |
| prior | Yes. I was in hospital with this last winter. | after a combination of treatments, minute 18 |
| pmh | Heart failure for four years, and a heart attack ten years ago. | after a combination of treatments, minute 18 |
| meds | Furosemide, ramipril and bisoprolol. | after a combination of treatments, minute 18 |
| adherence | I ran out of my water tablet a week ago. I could not get to the pharmacy. | after a combination of treatments, minute 18 |
| allergies | None that I know of. | after a combination of treatments, minute 18 |
| family | My brother had heart failure. | after a combination of treatments, minute 18 |
| social | I stopped smoking ten years ago. No alcohol. | after a combination of treatments, minute 18 |
| lastmeal | Soup at lunchtime. I could not eat much. | after a combination of treatments, minute 18 |
| infection | No cough or fever. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Fast and regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 18 |
| heart: aortic | Regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 63 |
| heart: pulmonic | Fast and regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 18 |
| heart: pulmonic | Regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 63 |
| heart: tricuspid | Fast and regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 18 |
| heart: tricuspid | Regular. Nothing abnormal is heard at this site. | after a combination of treatments, minute 63 |
| heart: mitral | A third heart sound (gallop) and a soft holosystolic murmur at the apex. | after a combination of treatments, minute 18 |
| heart: mitral | A softer third heart sound and a quieter murmur at the apex. | after a combination of treatments, minute 63 |
| lungs: upper | Crackles reach the upper zones. | after a combination of treatments, minute 18 |
| lungs: upper | The crackles in the upper zones have mostly cleared. | after a combination of treatments, minute 13 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 63 |
| lungs: lower | Coarse crackles at both bases. | after a combination of treatments, minute 18 |
| lungs: lower | Coarse crackles at the bases, fewer than before. | after a combination of treatments, minute 13 |
| lungs: lower | Fine crackles at the bases only. | after a combination of treatments, minute 63 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| I cannot catch my breath. I cannot lie down. | after a combination of treatments, minute 18 |
| Cannot... breathe... | after a combination of treatments, minute 25 |
| That is better. I can talk properly now. | after a combination of treatments, minute 63 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.25 | 1.3 | 1.4 | 0.7 | 0 | false | true | none | Dilated left ventricle with ejection fraction about 25%. Moderate functional mitral regurgitation. No pericardial effusion. | after a combination of treatments, minute 18 |
| 0.25 | 1.3 | 1.4 | 0.7 | 0 | false | true | none | Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is lessening and the inferior vena cava is less dilated. No pericardial effusion. | after a combination of treatments, minute 13 |
| 0.25 | 1.2 | 1.4 | 0.7 | 0 | false | false | none | Dilated left ventricle with ejection fraction about 25%. The mitral regurgitation is now mild and the inferior vena cava collapses with breathing. No pericardial effusion. | after a combination of treatments, minute 63 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: no | after a combination of treatments, minute 18 |
| blue lips: yes | after a combination of treatments, minute 18 |
| neck veins distended: yes | after a combination of treatments, minute 18 |
| leg swelling: yes | after a combination of treatments, minute 18 |
| labored breathing: yes | after a combination of treatments, minute 18 |
| distressed face: yes | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| blue lips: no | after a combination of treatments, minute 32 |
| labored breathing: no | after a combination of treatments, minute 32 |
| distressed face: no | after a combination of treatments, minute 32 |
| died: yes | after a combination of treatments, minute 32 |
| oxygen mask: o2 | after a combination of treatments, minute 47 |
| oxygen mask: niv | after a combination of treatments, minute 63 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| lbbb | after a combination of treatments, minute 18 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: s3, lungs: crackles | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the mitral site: heart: s3, lungs: crackles | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 63 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Cardiac Tamponade (PER-401)

**Categories:** Pericardial Disease. **Chief complaints:** Chest pain, Shortness of breath.

**Patient:** 45-year-old man with 3 days of worsening shortness of breath and chest discomfort that is easier when he leans forward. He recently had a viral illness. He is pale, sitting upright and very anxious.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 45-year-old man |
| Bay | 4 |
| Triage | level 1: Resuscitation |
| Posture | upright |
| Handover | Paramedic handover: 45-year-old man with 3 days of worsening breathlessness and chest discomfort that is easier when he leans forward. He had a viral illness last week. No regular medicines, no known allergies. He has become paler and sleepier on the way in. |

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
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2015 ESC Guidelines for the Diagnosis and Management of Pericardial Diseases |
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

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Grey, drenched in sweat and drowsy, barely able to talk. He is breathing fast and shallowly. | after a combination of treatments, minute 18 |
| General inspection | Pale, sweaty and anxious, sitting upright and breathing fast. | after a combination of treatments, minute 10 |
| General inspection | Calmer, color returning, breathing easier. | after a combination of treatments, minute 8 |
| General inspection | Pale, sweaty and anxious, but a little less drowsy since the fluid bolus. | after a combination of treatments, minute 7 |
| Listen to the heart | Distant, muffled heart sounds, fast at about 145/min. | after a combination of treatments, minute 18 |
| Listen to the heart | Regular, normal heart sounds at about 116/min. | after a combination of treatments, minute 8 |
| Listen to the lungs | Clear on both sides, but the breaths are fast and shallow. | after a combination of treatments, minute 18 |
| Listen to the lungs | Clear on both sides, with deeper breaths now. | after a combination of treatments, minute 8 |
| Check neck veins (JVP) | Neck veins are markedly raised, about 14 cm, and do not fall when he breathes in. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins are back to a normal height. | after a combination of treatments, minute 8 |
| Check pulses and perfusion | The pulses are barely palpable, very fast and thready. The pulse disappears altogether when he breathes in. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Fast, thin pulses. The systolic pressure falls by about 15 mmHg when he breathes in (pulsus paradoxus). | after a combination of treatments, minute 10 |
| Check pulses and perfusion | Strong, regular pulses. | after a combination of treatments, minute 8 |
| Check pulses and perfusion | Fast, thin pulses, a little fuller since the fluid bolus. The systolic pressure still falls about 15 mmHg when he breathes in. | after a combination of treatments, minute 7 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Sinus tachycardia 145/min. Very low voltage QRS complexes with marked electrical alternans. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus tachycardia 137/min. Low voltage QRS complexes with electrical alternans (the QRS height alternates beat to beat). | after a combination of treatments, minute 10 |
| 12-lead ECG | Sinus rhythm 116/min. Normal voltage. Diffuse mild ST elevation with PR depression (pericarditis). | after a combination of treatments, minute 8 |
| Troponin | Troponin I below 0.04 ng/mL (normal). | after a combination of treatments, minute 18 |
| BNP | BNP 80 pg/mL, normal. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 5.0, bicarbonate 16 (low), creatinine 1.9 mg/dL (rising). The organs are starved of blood. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 4.4, creatinine 1.3 mg/dL, slightly high from poor perfusion. | after a combination of treatments, minute 10 |
| Electrolytes and creatinine | Potassium 4.2, creatinine 1.1 mg/dL, improving as the circulation recovers. | after a combination of treatments, minute 8 |
| Chest X-ray | Enlarged, globe-shaped heart outline. Clear lung fields. | after a combination of treatments, minute 18 |
| Chest X-ray | The heart outline is smaller after drainage. Clear lung fields. | after a combination of treatments, minute 8 |
| Bedside echocardiogram | Large circumferential pericardial effusion with the right ventricle collapsing in diastole. Tamponade physiology. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Effusion reduced to a small rim. Right heart chambers fill normally. | after a combination of treatments, minute 8 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Test: Troponin | Troponin is normal at the start and after drainage: the heart muscle is not injured, the fluid around it is the problem. |
| Test: BNP | BNP is normal at the start and stays normal: the heart is not failing, it is being squeezed from outside. |

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

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | I cannot get my breath, and my chest hurts. | after a combination of treatments, minute 18 |
| complaint | I feel so much better now. | after a combination of treatments, minute 8 |
| onset | It has been getting worse for three days. | after a combination of treatments, minute 18 |
| severity | 6 out of 10 when I breathe in. | after a combination of treatments, minute 18 |
| location | In the middle of my chest. | after a combination of treatments, minute 18 |
| quality | Sharp, and it catches when I breathe in. | after a combination of treatments, minute 18 |
| radiation | It goes into my left shoulder. | after a combination of treatments, minute 18 |
| provoking | It is better when I lean forward. Lying flat is terrible. | after a combination of treatments, minute 18 |
| breathless | Yes. I cannot lie flat. | after a combination of treatments, minute 18 |
| syncope | I feel faint when I stand up. | after a combination of treatments, minute 18 |
| infection | I had a nasty cold and a fever last week. | after a combination of treatments, minute 18 |
| pmh | Nothing. I am usually healthy. | after a combination of treatments, minute 18 |
| meds | None. I took ibuprofen for the pain. | after a combination of treatments, minute 18 |
| adherence | I do not take any regular medicines. | after a combination of treatments, minute 18 |
| allergies | None. | after a combination of treatments, minute 18 |
| family | Nothing that I know of. | after a combination of treatments, minute 18 |
| social | I do not smoke. A couple of beers at the weekend. | after a combination of treatments, minute 18 |
| lastmeal | Yesterday evening. I have no appetite. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Distant, muffled heart sounds, even at the aortic area. | after a combination of treatments, minute 18 |
| heart: aortic | Normal heart sounds, heard clearly at the aortic area. | after a combination of treatments, minute 8 |
| heart: pulmonic | Distant, muffled heart sounds, even at the pulmonic area. | after a combination of treatments, minute 18 |
| heart: pulmonic | Normal heart sounds, heard clearly at the pulmonic area. | after a combination of treatments, minute 8 |
| heart: tricuspid | Distant, muffled heart sounds. No rub is heard. | after a combination of treatments, minute 18 |
| heart: tricuspid | Normal heart sounds. The pericardial rub of pericarditis is heard at the lower left sternal edge. | after a combination of treatments, minute 8 |
| heart: mitral | Distant, muffled heart sounds, fast. No murmur. | after a combination of treatments, minute 18 |
| heart: mitral | Normal heart sounds, regular at the apex. No murmur. | after a combination of treatments, minute 8 |
| lungs: upper | Clear in the upper zones, but the breath sounds are quiet. | after a combination of treatments, minute 18 |
| lungs: upper | Clear in the upper zones, with good air entry. | after a combination of treatments, minute 8 |
| lungs: lower | Clear at the bases. Breath sounds are quiet because he is breathing shallowly. | after a combination of treatments, minute 18 |
| lungs: lower | Clear at the bases, with good air entry. | after a combination of treatments, minute 8 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| It hurts when I breathe in, and I cannot lie flat. | after a combination of treatments, minute 18 |
| I cannot breathe. I am so tired. | after a combination of treatments, minute 25 |
| I can breathe again. | after a combination of treatments, minute 8 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.65 | 0.9 | 1 | 1 | 1 | true | false | none | Large circumferential pericardial effusion with the right ventricle collapsing in diastole. Tamponade physiology. | after a combination of treatments, minute 18 |
| 0.65 | 0.9 | 1 | 1 | 0.15 | false | false | none | Effusion reduced to a small rim. Right heart chambers fill normally. | after a combination of treatments, minute 8 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: yes | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: yes | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: yes | after a combination of treatments, minute 18 |
| distressed face: yes | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| distressed face: no | after a combination of treatments, minute 3 |
| sweating: no | after a combination of treatments, minute 8 |
| neck veins distended: no | after a combination of treatments, minute 8 |
| labored breathing: no | after a combination of treatments, minute 8 |
| pericardial drain: yes | after a combination of treatments, minute 8 |
| oxygen mask: o2 | after a combination of treatments, minute 29 |
| blue lips: yes | after a combination of treatments, minute 46 |
| defibrillator pads: yes | after a combination of treatments, minute 47 |
| died: yes | after a combination of treatments, minute 47 |
| oxygen mask: niv | after a combination of treatments, minute 40 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| low-voltage | after a combination of treatments, minute 18 |
| pericarditis | after a combination of treatments, minute 8 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the aortic site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the mitral site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the upper site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| at the lower site: heart: muffled, lungs: clear | after a combination of treatments, minute 18 |
| heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 8 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Stable Supraventricular Tachycardia (ARR-202)

**Categories:** Arrhythmia. **Chief complaints:** Palpitations.

**Patient:** 31-year-old woman with a sudden racing heartbeat. She is anxious but comfortable, talking in full sentences, and her blood pressure is normal.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 31-year-old woman |
| Bay | 7 |
| Triage | level 3: Urgent |
| Posture | reclined |
| Handover | Paramedic handover: 31-year-old woman with a sudden racing heartbeat that began 40 minutes ago at her desk. No chest pain. She has had two similar short episodes that stopped by themselves. Healthy, no regular medicines. Heart rate 180, regular. Blood pressure 126 over 80. |

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 182 /min |
| Blood pressure | 125/80 mmHg |
| SpO2 | 98 % |
| Respiratory rate | 18 /min |
| Temperature | 36.8 C |
| Rhythm | svt |
| Starting severity | 0.25 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.25 |
| growthPerMin | 0.003 |
| sinusRatePerMin | -0.02 |
| vagalRelief | 0.02 |
| stableSeverity | 0.2 |
| stableHrBelow | 110 |
| harm.norepi | 0.1 |
| hrCap | 220 |
| vitals.hrSvt | [157, 100] |
| vitals.hrSinus | [70, 30] |
| vitals.sbp | [140, -60] |
| vitals.dbp | [90, -40] |
| vitals.spo2 | [99, -6] |
| vitals.rr | [14, 16] |
| vitals.temp | [36.8, 0] |

### Rules

- Severity (0 to 1) rises by 0.003 per minute while the tachycardia continues. After conversion to sinus it falls by 0.02 per minute.
- A vagal maneuver lowers severity by 0.02 once but does not convert the rhythm.
- Adenosine, diltiazem, metoprolol or a synchronized shock converts the rhythm to sinus.
- The patient stabilizes when the rhythm is sinus, severity is 0.2 or less and heart rate is below 110. The patient dies when severity reaches 1.
- Norepinephrine adds 0.1 to severity.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Vagal maneuver (modified Valsalva) | helpful | no | A vagal maneuver is the first treatment for a stable regular narrow tachycardia. It often fails and does no harm. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Adenosine rapid IV push | helpful | no | Adenosine stops the re-entry circuit and is the first drug for a regular narrow tachycardia. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Diltiazem IV | helpful | no | Diltiazem is an alternative if adenosine does not work, in a patient who is stable with normal heart function. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Metoprolol IV | helpful | no | A beta-blocker is an alternative if adenosine does not work, in a stable patient. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Synchronized cardioversion | neutral | no | Not needed while she is stable. A vagal maneuver and adenosine come first, and a shock needs sedation. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Norepinephrine infusion | harmful | no | A vasopressor raises blood pressure and can make the tachycardia worse. She is not hypotensive. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Oxygen by mask | neutral | no | Her oxygen saturation is normal. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Anxious but comfortable. The vagal maneuver slowed her heart for a moment, then it raced again. | after a combination of treatments, minute 18 |
| General inspection | Anxious but comfortable, a little pale, talking in full sentences. | after a combination of treatments, minute 10 |
| General inspection | Calm and comfortable. | after a combination of treatments, minute 4 |
| Listen to the heart | Very fast and perfectly regular, about 185/min. Normal sounds, no murmur. | after a combination of treatments, minute 18 |
| Listen to the heart | Regular at about 108/min. Normal sounds. | after a combination of treatments, minute 4 |
| Listen to the lungs | Clear on both sides. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Not raised. Rapid regular pulsations are visible in the neck. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Not raised. | after a combination of treatments, minute 4 |
| Check pulses and perfusion | Fast, regular and thready. It slowed for a few beats during the vagal maneuver, then raced again. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Fast, regular, thready radial pulse, too fast to count exactly. Warm hands. | after a combination of treatments, minute 10 |
| Check pulses and perfusion | Regular pulse, equal in both arms. | after a combination of treatments, minute 4 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Regular narrow-complex tachycardia at 185/min with no visible P waves and mild ST depression. Supraventricular tachycardia. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus rhythm 108/min. Normal. No delta wave. | after a combination of treatments, minute 4 |
| Troponin | Troponin I below 0.04 ng/mL (normal). | after a combination of treatments, minute 18 |
| BNP | BNP 40 pg/mL, normal. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 4.1, magnesium 2.0, creatinine 0.8 mg/dL. | after a combination of treatments, minute 18 |
| Chest X-ray | Normal heart size. Clear lung fields. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Normal pumping, ejection fraction about 60%. Normal valves. No pericardial effusion. | after a combination of treatments, minute 18 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Examination: Listen to the lungs | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |
| Test: Troponin | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |
| Test: BNP | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |
| Test: Electrolytes and creatinine | Nothing the learner can give changes the electrolytes, and they were normal to begin with. |
| Test: Chest X-ray | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |
| Test: Bedside echocardiogram | The heart is structurally normal, and its structure does not change in minutes. Only the rhythm changes. |
| Listening site: lungs upper | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |
| Listening site: lungs lower | This is normal at the start and stays normal: the problem is the rhythm, not the lungs or the heart muscle. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The ECG confirms a regular narrow-complex tachycardia and looks for pre-excitation. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Electrolytes and creatinine | Potassium and magnesium matter before giving rhythm drugs. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Check pulses and perfusion | Checking the pulse and perfusion shows she is stable. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 20 | 10 | It confirms the rhythm. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Try a vagal maneuver first | Vagal maneuver (modified Valsalva) | 20 | 8 | It is the first treatment for a stable regular narrow tachycardia. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Convert with adenosine (or diltiazem or a beta-blocker) | Adenosine rapid IV push or Diltiazem IV or Metoprolol IV | 40 | 20 | Adenosine ends the tachycardia. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Check the pulse and perfusion | Check pulses and perfusion | 10 | 10 | It shows she is stable and a shock is not needed. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |
| Check electrolytes | Electrolytes and creatinine | 10 | 30 | Low potassium or magnesium makes rhythms worse. | 2015 ACC/AHA/HRS Guideline for the Management of Adult Patients With Supraventricular Tachycardia |

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | My heart suddenly started racing. | after a combination of treatments, minute 18 |
| complaint | My heart feels normal again. | after a combination of treatments, minute 4 |
| onset | Forty minutes ago, at my desk. It came on all at once. | after a combination of treatments, minute 18 |
| severity | It is not painful, just very uncomfortable. | after a combination of treatments, minute 18 |
| location | In my chest, and I can feel it in my neck. | after a combination of treatments, minute 18 |
| palpitations | Yes. It is fast and perfectly regular, like a machine. | after a combination of treatments, minute 18 |
| syncope | A bit light-headed, but I have not fainted. | after a combination of treatments, minute 18 |
| breathless | A little. | after a combination of treatments, minute 18 |
| prior | Twice before. Short episodes that stopped by themselves. | after a combination of treatments, minute 18 |
| pmh | Nothing. I am healthy. | after a combination of treatments, minute 18 |
| meds | Only the contraceptive pill. | after a combination of treatments, minute 18 |
| adherence | I take it every day. | after a combination of treatments, minute 18 |
| allergies | Penicillin gives me a rash. | after a combination of treatments, minute 18 |
| family | No heart problems in my family. | after a combination of treatments, minute 18 |
| social | Three or four coffees a day, and an energy drink this morning. I do not smoke. | after a combination of treatments, minute 18 |
| lastmeal | A sandwich at lunch. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Very fast and regular. No murmur at the aortic area. | after a combination of treatments, minute 18 |
| heart: aortic | Regular. Normal sounds at the aortic area. | after a combination of treatments, minute 4 |
| heart: pulmonic | Very fast and regular. No murmur at the pulmonic area. | after a combination of treatments, minute 18 |
| heart: pulmonic | Regular. Normal sounds at the pulmonic area. | after a combination of treatments, minute 4 |
| heart: tricuspid | Very fast and regular. No murmur at the lower left sternal edge. | after a combination of treatments, minute 18 |
| heart: tricuspid | Regular. Normal sounds at the lower left sternal edge. | after a combination of treatments, minute 4 |
| heart: mitral | Very fast and regular, too fast to separate the heart sounds. No murmur. | after a combination of treatments, minute 18 |
| heart: mitral | Regular. Normal sounds at the apex. | after a combination of treatments, minute 4 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 18 |
| lungs: lower | Clear at the bases. | after a combination of treatments, minute 18 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| It started all at once. My heart is pounding. | after a combination of treatments, minute 18 |
| Oh, that is much better. | after a combination of treatments, minute 4 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.6 | 1 | 1 | 1 | 0 | false | false | none | Normal pumping, ejection fraction about 60%. Normal valves. No pericardial effusion. | after a combination of treatments, minute 18 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: no | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: no | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: no | after a combination of treatments, minute 18 |
| distressed face: no | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| oxygen mask: o2 | after a combination of treatments, minute 62 |
| distressed face: yes | after a combination of treatments, minute 84 |
| labored breathing: yes | after a combination of treatments, minute 91 |
| oxygen mask: niv | after a combination of treatments, minute 62 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| svt | after a combination of treatments, minute 18 |
| normal | after a combination of treatments, minute 4 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Unstable Ventricular Tachycardia (ARR-203)

**Categories:** Arrhythmia. **Chief complaints:** Palpitations, Chest pain, Dizziness.

**Patient:** 57-year-old man with a fast, wide-complex rhythm. He is dizzy, confused and sweaty, and his blood pressure is low.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 57-year-old man |
| Bay | 6 |
| Triage | level 1: Resuscitation |
| Posture | reclined |
| Handover | Paramedic handover: 57-year-old man with sudden palpitations and chest tightness 20 minutes ago, now dizzy and confused. Heart attack two years ago, treated with a stent. Heart rate 190, blood pressure 80 over 50, oxygen saturation 93%. Contrast dye gave him a rash. |

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 189 /min |
| Blood pressure | 77/49 mmHg |
| SpO2 | 93 % |
| Respiratory rate | 24 /min |
| Temperature | 36.7 C |
| Rhythm | vt |
| Starting severity | 0.55 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.55 |
| growthPerMin | 0.012 |
| amiodaroneFactor | 0.7 |
| sinusRatePerMin | -0.02 |
| cardioversionBenefit | 0.4 |
| recurAfterMin | 12 |
| recurSeverity | 0.5 |
| monitorMin | 15 |
| stableSeverity | 0.2 |
| oxygenRelief | 0.001 |
| harm.diltiazem | 0.15 |
| harm.metoprolol | 0.12 |
| harm.adenosine | 0.1 |
| harm.defib | 0.1 |
| hrCap | 220 |
| vitals.hrVt | [150, 70] |
| vitals.hrSinus | [75, 40] |
| vitals.sbp | [140, -115] |
| vitals.dbp | [90, -75] |
| vitals.spo2 | [99, -11] |
| vitals.rr | [14, 18] |
| vitals.temp | [36.7, 0] |

### Rules

- Severity (0 to 1) rises by 0.012 per minute while the tachycardia continues. Amiodarone multiplies that by 0.7. Oxygen lowers it by 0.001.
- A synchronized shock converts the rhythm to sinus and lowers severity by 0.4. After that severity falls by 0.02 per minute.
- Without amiodarone the tachycardia comes back 12 minutes after the first shock, once, and severity returns to at least 0.5.
- The patient stabilizes when the rhythm is sinus, severity is 0.2 or less, and either amiodarone has been given or 15 minutes have passed since the shock. The patient dies when severity reaches 1.
- Diltiazem adds 0.15, metoprolol 0.12, adenosine 0.1 and an unsynchronized shock 0.1 to severity.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Synchronized cardioversion | helpful | yes, see Parameters | Synchronized cardioversion is the treatment for a ventricular tachycardia that is causing low blood pressure. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Amiodarone IV | helpful | no | Amiodarone after cardioversion helps stop the tachycardia coming back. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Oxygen by mask | helpful | no | His oxygen saturation is low. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Diltiazem IV | harmful | no | A calcium channel blocker can collapse the blood pressure in ventricular tachycardia. A wide-complex tachycardia is ventricular until proven otherwise. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Metoprolol IV | harmful | no | A beta-blocker weakens a heart that is already failing and can drop blood pressure. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Adenosine rapid IV push | harmful | no | Adenosine does not treat ventricular tachycardia and can drop the blood pressure. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock on a patient who has a pulse can trigger ventricular fibrillation. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Pale, sweaty and drowsy, clutching his chest. | after a combination of treatments, minute 18 |
| General inspection | Calmer, color returning, no longer sweating. | after a combination of treatments, minute 17 |
| General inspection | Pale, sweaty and drowsy again, clutching his chest. The tachycardia has come back. | after a combination of treatments, minute 31 |
| General inspection | Calmer, color returning, no longer sweating. An amiodarone infusion is running. | after a combination of treatments, minute 33 |
| Listen to the heart | Very fast and regular. The first heart sound varies in loudness. | after a combination of treatments, minute 18 |
| Listen to the heart | Regular at about 87/min. | after a combination of treatments, minute 17 |
| Listen to the lungs | Clear on both sides. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins show occasional large pulsations (cannon waves). | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Not raised. | after a combination of treatments, minute 17 |
| Check pulses and perfusion | Fast, weak pulse. Cool hands. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Regular pulse. Warm hands. | after a combination of treatments, minute 17 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Regular wide-complex tachycardia at 201/min, no P waves, QRS about 160 ms. Ventricular tachycardia. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus rhythm with old anterior Q waves. | after a combination of treatments, minute 17 |
| Troponin | Troponin I 0.08 ng/mL (normal below 0.04), mildly raised. | after a combination of treatments, minute 18 |
| BNP | BNP 540 pg/mL, raised. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 3.4 (low), magnesium 1.5 (low), creatinine 1.2 mg/dL. | after a combination of treatments, minute 18 |
| Chest X-ray | Mild cardiomegaly. Clear lung fields. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Reduced pumping, ejection fraction about 30%. A thin, akinetic scar in the anterior wall and apex. No pericardial effusion. | after a combination of treatments, minute 18 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Examination: Listen to the lungs | The lungs are clear throughout: this is a rhythm problem, and the rhythm does not flood the lungs in minutes. |
| Test: Troponin | This reflects his old heart attack and scar, which a shock and a drug do not change in minutes. The small troponin leak is from the old scar. |
| Test: BNP | This reflects his old heart attack and scar, which a shock and a drug do not change in minutes. BNP falls over days, not minutes. |
| Test: Electrolytes and creatinine | Nothing the learner can give replaces potassium or magnesium, so they stay low, and low levels are part of why the tachycardia returns. |
| Test: Chest X-ray | The chest X-ray is mildly abnormal from the old heart attack and does not change in minutes. |
| Test: Bedside echocardiogram | This reflects his old heart attack and scar, which a shock and a drug do not change in minutes. |
| Listening site: lungs upper | The lungs are clear throughout: this is a rhythm problem, not a lung problem. |
| Listening site: lungs lower | The lungs are clear throughout: this is a rhythm problem, not a lung problem. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The 12-lead shows the wide-complex tachycardia, but must never delay a shock in an unstable patient. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| General inspection | Looking for pallor, sweating and confusion shows he is unstable. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Check pulses and perfusion | A weak pulse and cool hands show poor perfusion. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Electrolytes and creatinine | Low potassium and magnesium make ventricular arrhythmias return. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Bedside echocardiogram | Echo shows the old scar that causes the rhythm. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Give a synchronized shock | Synchronized cardioversion | 40 | 5 | An unstable tachycardia needs a synchronized shock at once. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Assess perfusion | General inspection or Check pulses and perfusion | 10 | 5 | It shows he is unstable. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Get a 12-lead ECG | 12-lead ECG | 10 | 15 | It confirms ventricular tachycardia once he is treated. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Give amiodarone to stop it returning | Amiodarone IV | 20 | 20 | It prevents a relapse after cardioversion. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Give oxygen | Oxygen by mask | 10 | 10 | His saturation is low. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |
| Check electrolytes | Electrolytes and creatinine | 10 | 30 | Low potassium and magnesium need correcting. | 2017 AHA/ACC/HRS Guideline for Management of Patients With Ventricular Arrhythmias and the Prevention of Sudden Cardiac Death |

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | My heart started pounding and my chest got tight. | after a combination of treatments, minute 18 |
| onset | About twenty minutes ago, while I was gardening. | after a combination of treatments, minute 18 |
| severity | The chest tightness is a 5 out of 10. | after a combination of treatments, minute 18 |
| palpitations | Yes. It is very fast and strong. | after a combination of treatments, minute 18 |
| syncope | I nearly passed out. I feel faint now. | after a combination of treatments, minute 18 |
| breathless | A little. | after a combination of treatments, minute 18 |
| prior | Never like this. | after a combination of treatments, minute 18 |
| pmh | A heart attack two years ago. I have a stent. | after a combination of treatments, minute 18 |
| meds | Aspirin, atorvastatin, ramipril and metoprolol. | after a combination of treatments, minute 18 |
| adherence | I take them every day. | after a combination of treatments, minute 18 |
| allergies | Contrast dye gave me a rash. | after a combination of treatments, minute 18 |
| family | My father died suddenly at 50. | after a combination of treatments, minute 18 |
| social | Occasional alcohol. I do not smoke. | after a combination of treatments, minute 18 |
| lastmeal | Lunch, two hours ago. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Very fast and regular. No murmur. | after a combination of treatments, minute 18 |
| heart: aortic | Regular. No murmur. | after a combination of treatments, minute 17 |
| heart: pulmonic | Very fast and regular. No murmur. | after a combination of treatments, minute 18 |
| heart: pulmonic | Regular. No murmur. | after a combination of treatments, minute 17 |
| heart: tricuspid | Very fast and regular. The first sound varies in loudness from beat to beat. | after a combination of treatments, minute 18 |
| heart: tricuspid | Regular. No murmur. | after a combination of treatments, minute 17 |
| heart: mitral | Very fast and regular. The first sound varies in loudness from beat to beat. | after a combination of treatments, minute 18 |
| heart: mitral | Regular. A soft third heart sound. | after a combination of treatments, minute 17 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 18 |
| lungs: lower | Clear at the bases. | after a combination of treatments, minute 18 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| I am going to pass out... | after a combination of treatments, minute 18 |
| My heart is pounding. I feel dizzy and my chest is tight. | after a combination of treatments, minute 10 |
| My heart has stopped racing. | after a combination of treatments, minute 17 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.3 | 1.15 | 1 | 0.8 | 0 | false | false | anterior-apex | Reduced pumping, ejection fraction about 30%. A thin, akinetic scar in the anterior wall and apex. No pericardial effusion. | after a combination of treatments, minute 18 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: yes | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: no | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: yes | after a combination of treatments, minute 18 |
| distressed face: yes | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| labored breathing: no | after a combination of treatments, minute 3 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| sweating: no | after a combination of treatments, minute 30 |
| distressed face: no | after a combination of treatments, minute 30 |
| died: yes | after a combination of treatments, minute 30 |
| oxygen mask: o2 | after a combination of treatments, minute 20 |
| oxygen mask: niv | after a combination of treatments, minute 28 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| vt | after a combination of treatments, minute 18 |
| normal | after a combination of treatments, minute 17 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 18 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Cardiogenic Shock (SHK-501)

**Categories:** Shock. **Chief complaints:** Chest pain, Shortness of breath, Confusion.

**Patient:** 64-year-old man with 3 hours of crushing chest pain. He is now cold, clammy, confused and struggling to breathe, and his blood pressure is falling.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 64-year-old man |
| Bay | 3 |
| Triage | level 1: Resuscitation |
| Posture | reclined |
| Handover | Paramedic handover: 64-year-old man with 3 hours of crushing central chest pain, now confused, sweaty and short of breath. Blood pressure 82 over 54 and falling, heart rate 118, oxygen saturation 86% on air. Two previous heart attacks and diabetes. He has had no treatment. No known allergies. |

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 120 /min |
| Blood pressure | 75/55 mmHg |
| SpO2 | 87 % |
| Respiratory rate | 28 /min |
| Temperature | 36.3 C |
| Rhythm | sinus |
| Starting severity | 0.5 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.5 |
| growthPerMin | 0.015 |
| norepiRelief | 0.008 |
| dobutamineRelief | 0.005 |
| nivRelief | 0.003 |
| oxygenRelief | 0.001 |
| aspirinRelief | 0.001 |
| pciDelayMin | 30 |
| reperfusionRatePerMin | -0.03 |
| stableSeverity | 0.25 |
| stableSbp | 90 |
| norepiSbpSupport | 18 |
| harm.fluids | 0.1 |
| harm.nitro | 0.12 |
| harm.metoprolol | 0.15 |
| harm.diltiazem | 0.15 |
| harm.cardioversion | 0.05 |
| harm.pericardiocentesis | 0.08 |
| vitals.hr | [90, 60] |
| vitals.sbp | [130, -110] |
| vitals.dbp | [85, -60] |
| vitals.spo2 | [98, -22] |
| vitals.rr | [16, 24] |
| vitals.temp | [36.6, -0.6] |
| hrCap | 150 |

### Rules

- Severity (0 to 1) rises by 0.015 per minute. Norepinephrine lowers that by 0.008, dobutamine by 0.005, BiPAP by 0.003 (oxygen alone by 0.001) and aspirin by 0.001.
- Norepinephrine also lifts systolic pressure by 18 mmHg.
- Activating the cath lab opens the artery 30 minutes later. After that severity falls by 0.03 per minute.
- The patient stabilizes when the artery is open, severity is 0.25 or less and systolic pressure is 90 or more. The patient dies when severity reaches 1.
- A fluid bolus adds 0.1, nitroglycerin 0.12, metoprolol 0.15, diltiazem 0.15, cardioversion 0.05 and pericardiocentesis 0.08 to severity.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Norepinephrine infusion | helpful | no | Norepinephrine is the first-choice vasopressor in cardiogenic shock. It holds up blood pressure while the artery is opened. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Dobutamine infusion | helpful | no | An inotrope helps a failing heart pump harder when blood pressure is supported. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Activate cath lab (primary PCI) | helpful | no | Reopening the blocked artery is the treatment that changes the outcome in shock from a heart attack. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Oxygen by mask | helpful | no | He is hypoxic and needs oxygen. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Non-invasive ventilation (BiPAP) | helpful | no | BiPAP supports breathing in pulmonary edema, with close watch on blood pressure. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Aspirin 325 mg, chewed | helpful | no | Aspirin is still part of acute coronary syndrome care. | 2013 ACCF/AHA Guideline for the Management of ST-Elevation Myocardial Infarction |
| IV fluid bolus 500 mL | harmful | no | Fluid overloads a failing left ventricle and floods the lungs. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Nitroglycerin sublingual | harmful | no | Nitrates drop blood pressure further when he is already in shock. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Metoprolol IV | harmful | no | A beta-blocker weakens the heart and can tip a patient in shock into arrest. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Diltiazem IV | harmful | no | Diltiazem weakens heart contraction and drops blood pressure. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Synchronized cardioversion | harmful | no | He is in sinus rhythm, so a shock has no benefit. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Pericardiocentesis | harmful | no | There is no effusion to drain. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Furosemide 40 mg IV | neutral | no | A diuretic can help the lungs once blood pressure is supported, but it does not treat the shock. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Pale, cold and clammy, drowsy and short of breath. The skin is mottled at the knees. | after a combination of treatments, minute 18 |
| General inspection | Grey, mottled and barely responding. | after a combination of treatments, minute 25 |
| General inspection | Gasping and even more drowsy since the fluid bolus. | after a combination of treatments, minute 13 |
| General inspection | Still pale and clammy, but warmer at the hands and a little more alert since the pressor. | after a combination of treatments, minute 24 |
| General inspection | Pale, but warmer and more alert. Breathing easier. | after a combination of treatments, minute 43 |
| Listen to the heart | Fast and regular at about 134/min. A third heart sound (gallop). | after a combination of treatments, minute 18 |
| Listen to the heart | Very fast at about 142/min with extra beats. The gallop and the murmur are louder. | after a combination of treatments, minute 25 |
| Listen to the heart | Fast and regular at about 129/min. The third heart sound is softer. | after a combination of treatments, minute 43 |
| Listen to the lungs | Crackles up to the mid-zones on both sides. | after a combination of treatments, minute 18 |
| Listen to the lungs | Crackles to the top of both lungs after the fluid. | after a combination of treatments, minute 13 |
| Listen to the lungs | Crackles up to the mid-zones, with better air entry on BiPAP. | after a combination of treatments, minute 8 |
| Listen to the lungs | Crackles at the bases only. | after a combination of treatments, minute 43 |
| Check neck veins (JVP) | Neck veins are raised, about 12 cm. | after a combination of treatments, minute 18 |
| Check neck veins (JVP) | Neck veins are still raised but lower, about 9 cm. | after a combination of treatments, minute 43 |
| Check pulses and perfusion | Pulses are barely palpable and fast. Cold hands and feet. Capillary refill is slow. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Weak, thready pulses. Cool hands and feet. | after a combination of treatments, minute 14 |
| Check pulses and perfusion | The pulses are stronger and the hands are warming up. | after a combination of treatments, minute 51 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Sinus tachycardia 134/min. ST elevation in V1 to V5 with Q waves, and reciprocal ST depression inferiorly. Extensive anterior STEMI. | after a combination of treatments, minute 18 |
| 12-lead ECG | Sinus tachycardia 142/min with frequent ventricular ectopic beats. ST elevation in V1 to V5 with Q waves. Extensive anterior STEMI. | after a combination of treatments, minute 25 |
| 12-lead ECG | Sinus tachycardia 129/min. ST elevation in V1 to V4 is falling, with T wave inversion. Reperfusion pattern. | after a combination of treatments, minute 43 |
| Troponin | Troponin I 11.1 ng/mL (normal below 0.04), markedly raised and rising. | after a combination of treatments, minute 18 |
| Troponin | Troponin I 12.9 ng/mL (normal below 0.04). It is still rising after reperfusion, as expected. | after a combination of treatments, minute 43 |
| BNP | BNP 1,400 pg/mL, markedly raised. | after a combination of treatments, minute 18 |
| BNP | BNP 1,100 pg/mL, still markedly raised. It falls over days. | after a combination of treatments, minute 43 |
| Electrolytes and creatinine | Potassium 4.6, bicarbonate 17 (low), creatinine 1.9 mg/dL (rising). Lactate 5.2 mmol/L (high). | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 5.3, bicarbonate 12 (very low), creatinine 2.4 mg/dL. Lactate 8.1 mmol/L (very high). | after a combination of treatments, minute 25 |
| Electrolytes and creatinine | Potassium 4.6, bicarbonate 18, creatinine 1.9 mg/dL. Lactate 4.4 mmol/L, falling slowly with the pressor. | after a combination of treatments, minute 24 |
| Electrolytes and creatinine | Potassium 4.4, bicarbonate 21, creatinine 1.8 mg/dL. Lactate 2.6 mmol/L, falling. | after a combination of treatments, minute 43 |
| Chest X-ray | Pulmonary edema with a normal-sized heart. | after a combination of treatments, minute 18 |
| Chest X-ray | Worse pulmonary edema with a normal-sized heart, since the fluid bolus. | after a combination of treatments, minute 13 |
| Chest X-ray | Pulmonary edema is clearing, with a normal-sized heart. | after a combination of treatments, minute 43 |
| Bedside echocardiogram | Severely reduced pumping, ejection fraction about 15%. The anterior wall and apex do not move. Moderate mitral regurgitation. No pericardial effusion. | after a combination of treatments, minute 18 |
| Bedside echocardiogram | Severely reduced pumping, ejection fraction about 20%. The anterior wall and apex are stunned and barely move. The mitral regurgitation is milder. No pericardial effusion. | after a combination of treatments, minute 43 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The ECG shows the cause: a large anterior heart attack. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Bedside echocardiogram | Echo shows the pump failure and excludes tamponade and a ruptured valve. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Electrolytes and creatinine | Lactate and kidney function show how badly organs are starved of blood. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Check pulses and perfusion | Cold hands and feet and weak pulses show the shock. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 15 | 10 | It finds the cause quickly. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Get a bedside echocardiogram | Bedside echocardiogram | 15 | 15 | It confirms pump failure and excludes other causes of shock. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Start norepinephrine to support blood pressure | Norepinephrine infusion | 25 | 15 | Blood pressure must be held while the artery is opened. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Activate the cath lab | Activate cath lab (primary PCI) | 30 | 20 | Reopening the artery is the treatment that changes the outcome. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Start dobutamine to help the pump | Dobutamine infusion | 10 | 30 | An inotrope supports a failing heart. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |
| Support breathing (BiPAP or oxygen) | Non-invasive ventilation (BiPAP) or Oxygen by mask | 5 | 15 | He is hypoxic. | 2017 AHA Scientific Statement on the Contemporary Management of Cardiogenic Shock |

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | My chest has been squeezing for hours. And I cannot breathe. | after a combination of treatments, minute 18 |
| onset | This morning. About three hours ago. | after a combination of treatments, minute 18 |
| severity | 7 out of 10. | after a combination of treatments, minute 18 |
| location | All across my chest. | after a combination of treatments, minute 18 |
| radiation | Into my left arm. | after a combination of treatments, minute 18 |
| sweating | Yes, I am soaked. | after a combination of treatments, minute 18 |
| nausea | I have been sick twice. | after a combination of treatments, minute 18 |
| breathless | Yes. I cannot lie flat. I am drowning. | after a combination of treatments, minute 18 |
| syncope | I feel like I will pass out. | after a combination of treatments, minute 18 |
| prior | Two heart attacks before, but nothing like today. | after a combination of treatments, minute 18 |
| pmh | Two heart attacks and diabetes. | after a combination of treatments, minute 18 |
| meds | Aspirin, metoprolol, ramipril and metformin. | after a combination of treatments, minute 18 |
| adherence | I take them every day. | after a combination of treatments, minute 18 |
| allergies | None. | after a combination of treatments, minute 18 |
| social | I gave up smoking after my last heart attack. | after a combination of treatments, minute 18 |
| family | My brother died of a heart attack. | after a combination of treatments, minute 18 |
| lastmeal | Breakfast. I have not kept anything down since. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | Fast and regular. Nothing abnormal at this site. | after a combination of treatments, minute 18 |
| heart: aortic | Regular, a little fast. Nothing abnormal at this site. | after a combination of treatments, minute 43 |
| heart: pulmonic | Fast and regular. Nothing abnormal at this site. | after a combination of treatments, minute 18 |
| heart: pulmonic | Regular, a little fast. Nothing abnormal at this site. | after a combination of treatments, minute 43 |
| heart: tricuspid | Fast and regular. Nothing abnormal at this site. | after a combination of treatments, minute 18 |
| heart: tricuspid | Regular, a little fast. Nothing abnormal at this site. | after a combination of treatments, minute 43 |
| heart: mitral | A third heart sound (gallop) and a holosystolic murmur at the apex from mitral regurgitation. | after a combination of treatments, minute 18 |
| heart: mitral | A softer third heart sound and a quieter murmur at the apex. | after a combination of treatments, minute 43 |
| lungs: upper | Crackles reach the upper zones. | after a combination of treatments, minute 18 |
| lungs: upper | Crackles to the very top of the upper zones. | after a combination of treatments, minute 13 |
| lungs: upper | Crackles at the edges of the upper zones. | after a combination of treatments, minute 43 |
| lungs: lower | Coarse crackles at both bases. | after a combination of treatments, minute 18 |
| lungs: lower | Crackles at the bases only. | after a combination of treatments, minute 43 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| I... cannot... I feel like I am dying. | after a combination of treatments, minute 18 |
| I feel terrible. I cannot breathe, and my chest is so tight. | after a combination of treatments, minute 10 |
| The pain has gone. I can breathe again. | after a combination of treatments, minute 43 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.15 | 1.3 | 1.2 | 0.7 | 0 | false | true | anterior-apex | Severely reduced pumping, ejection fraction about 15%. The anterior wall and apex do not move. Moderate mitral regurgitation. No pericardial effusion. | after a combination of treatments, minute 18 |
| 0.2 | 1.3 | 1.2 | 0.7 | 0 | false | false | anterior-apex | Severely reduced pumping, ejection fraction about 20%. The anterior wall and apex are stunned and barely move. The mitral regurgitation is milder. No pericardial effusion. | after a combination of treatments, minute 43 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: yes | after a combination of treatments, minute 18 |
| blue lips: yes | after a combination of treatments, minute 18 |
| neck veins distended: yes | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: yes | after a combination of treatments, minute 18 |
| distressed face: yes | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| sweating: no | after a combination of treatments, minute 26 |
| blue lips: no | after a combination of treatments, minute 26 |
| labored breathing: no | after a combination of treatments, minute 26 |
| distressed face: no | after a combination of treatments, minute 26 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| died: yes | after a combination of treatments, minute 26 |
| oxygen mask: o2 | after a combination of treatments, minute 9 |
| oxygen mask: niv | after a combination of treatments, minute 8 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| anterior-stemi | after a combination of treatments, minute 18 |
| anterior-stemi-reperfused | after a combination of treatments, minute 43 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: s3, lungs: crackles | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the mitral site: heart: s3, lungs: crackles | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 43 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Cardiac Arrest (ARS-601)

**Categories:** Cardiac Arrest. **Chief complaints:** Collapse, No pulse.

**Patient:** 61-year-old man who collapsed in a shopping centre. He has no pulse and is not breathing. The monitor shows ventricular fibrillation.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 61-year-old man |
| Bay | 2 |
| Triage | level 1: Resuscitation |
| Posture | flat |
| Handover | Paramedic handover: 61-year-old man who collapsed in a shopping centre about 8 minutes ago. A bystander started chest compressions after 3 minutes. The paramedics found ventricular fibrillation and have not shocked him yet. No pulse, not breathing. A friend says he has had chest pain for two days. |

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 0 /min |
| Blood pressure | 0/0 mmHg |
| SpO2 | 63 % |
| Respiratory rate | 0 /min |
| Temperature | 36.4 C |
| Rhythm | vf |
| Starting severity | 0.5 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.5 |
| growthPerMin | 0.045 |
| cprFactor | 0.45 |
| epinephrineFactor | 0.8 |
| amiodaroneFactor | 0.9 |
| oxygenFactor | 0.95 |
| roscAtShock | 2 |
| roscSeverity | 0.45 |
| postRoscRatePerMin | -0.03 |
| stableSeverity | 0.2 |
| harm.cardioversion | 0.06 |
| harm.pericardiocentesis | 0.06 |
| harm.afterRosc | 0.06 |
| vitalsArrest.hr | [0, 0] |
| vitalsArrest.sbp | [0, 0] |
| vitalsArrest.dbp | [0, 0] |
| vitalsArrest.spo2 | [75, -25] |
| vitalsArrest.rr | [0, 0] |
| vitalsArrest.temp | [36.4, 0] |
| vitalsRosc.hr | [95, 60] |
| vitalsRosc.sbp | [125, -60] |
| vitalsRosc.dbp | [80, -40] |
| vitalsRosc.spo2 | [99, -12] |
| vitalsRosc.rr | [14, 10] |
| vitalsRosc.temp | [36, 0] |

### Rules

- Severity (0 to 1) rises by 0.045 per minute. Compressions multiply that by 0.45, epinephrine by 0.8, amiodarone by 0.9 and oxygen by 0.95.
- Heart rate and blood pressure read zero until a pulse returns. The rhythm is ventricular fibrillation.
- Each shock is counted. A pulse returns on the second shock or later only if compressions are running and epinephrine has been given. Otherwise the rhythm stays in fibrillation.
- When a pulse returns, severity is capped at 0.45, then falls by 0.03 per minute. The patient stabilizes when severity is 0.2 or less. The patient dies when severity reaches 1.
- After a pulse returns, compressions, a shock or epinephrine add 0.06 to severity. A synchronized shock or a pericardiocentesis in arrest adds 0.06.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Labetalol IV | harmful | no | Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Nicardipine IV infusion | harmful | no | Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Start chest compressions (CPR) | helpful | yes, see Parameters | High-quality compressions keep blood moving to the brain and heart until a shock can work. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Defibrillate (unsynchronized shock) | helpful | yes, see Parameters | Ventricular fibrillation is treated with a shock as soon as possible. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Epinephrine IV | helpful | yes, see Parameters | Epinephrine helps the heart respond to a shock and raises the pressure that feeds the heart during compressions. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Amiodarone IV | helpful | no | Amiodarone is given for ventricular fibrillation that keeps coming back after shocks. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Oxygen by mask | helpful | no | Breaths with oxygen go with compressions. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Synchronized cardioversion | harmful | no | A synchronized shock cannot find an R wave in fibrillation, so it does not deliver. Time is lost. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Pericardiocentesis | harmful | no | There is no sign of an effusion, and stopping compressions for a procedure costs time. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Unresponsive, pale and not breathing normally. The pupils are wide. | after a combination of treatments, minute 12 |
| General inspection | Unresponsive and pale, with the chest moving under the compressions. The pupils are wide and fixed. | after a combination of treatments, minute 8 |
| Listen to the heart | No heart sounds are heard. | after a combination of treatments, minute 12 |
| Listen to the heart | No spontaneous heart sounds. Only the sound of the compressions. | after a combination of treatments, minute 8 |
| Listen to the lungs | No breathing. No breath sounds. | after a combination of treatments, minute 12 |
| Listen to the lungs | The chest rises with each bag-mask breath. No spontaneous breathing. | after a combination of treatments, minute 12 |
| Check neck veins (JVP) | Not assessable. | after a combination of treatments, minute 12 |
| Check neck veins (JVP) | Not assessable. The neck veins pulse with each compression. | after a combination of treatments, minute 8 |
| Check pulses and perfusion | No carotid or femoral pulse. | after a combination of treatments, minute 12 |
| Check pulses and perfusion | No spontaneous pulse. A femoral pulse is felt with each compression, so the compressions are working. | after a combination of treatments, minute 8 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Ventricular fibrillation. No organized electrical activity. | after a combination of treatments, minute 12 |
| 12-lead ECG | Ventricular fibrillation with compression artifact. No organized electrical activity. | after a combination of treatments, minute 8 |
| Troponin | Troponin I 0.3 ng/mL (normal below 0.04), already rising. | after a combination of treatments, minute 12 |
| BNP | BNP 120 pg/mL. | after a combination of treatments, minute 12 |
| Electrolytes and creatinine | Potassium 4.0, bicarbonate 14 (low), creatinine 1.1 mg/dL. Lactate 9 mmol/L (very high). | after a combination of treatments, minute 12 |
| Chest X-ray | Normal heart size. Clear lungs. | after a combination of treatments, minute 12 |
| Chest X-ray | Normal heart size. Clear lungs. A fractured rib on the left from the compressions. | after a combination of treatments, minute 8 |
| Bedside echocardiogram | No organized cardiac contraction: the heart is quivering. No pericardial effusion. | after a combination of treatments, minute 12 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Start chest compressions | Start chest compressions (CPR) | 30 | 2 | Compressions must start at once. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Defibrillate | Defibrillate (unsynchronized shock) | 35 | 6 | Ventricular fibrillation needs a shock as soon as possible. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Give epinephrine | Epinephrine IV | 15 | 12 | Epinephrine is given in a shockable arrest after the second shock. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Give amiodarone | Amiodarone IV | 10 | 20 | Amiodarone is for ventricular fibrillation that persists after shocks. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |
| Ventilate with oxygen | Oxygen by mask | 10 | 10 | Breaths go with compressions. | 2020 AHA Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care |

### History answers (spoken by the paramedic)

| Topic | Answer | First seen |
| --- | --- | --- |
| collapse | A bystander saw him drop in the shopping centre about eight minutes ago. Compressions started after three minutes. We have not shocked him yet. | after a combination of treatments, minute 12 |
| complaint | Collapsed and unresponsive, no pulse. Ventricular fibrillation on the monitor. | after a combination of treatments, minute 12 |
| onset | About eight minutes ago. | after a combination of treatments, minute 12 |
| syncope | He was walking and simply dropped. | after a combination of treatments, minute 12 |
| prior | His friend says he has had chest pain on and off for two days. | after a combination of treatments, minute 12 |
| pmh | His wife says high cholesterol. He has not seen a doctor for years. | after a combination of treatments, minute 12 |
| meds | None that his wife knows of. | after a combination of treatments, minute 12 |
| allergies | None known. | after a combination of treatments, minute 12 |
| family | His father died suddenly at 52. | after a combination of treatments, minute 12 |
| social | He smokes about 20 a day. | after a combination of treatments, minute 12 |
| lastmeal | He had lunch an hour ago. | after a combination of treatments, minute 12 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | No heart sounds are heard. | after a combination of treatments, minute 12 |
| heart: aortic | Only compression noise. No spontaneous heart sounds. | after a combination of treatments, minute 8 |
| heart: pulmonic | No heart sounds are heard. | after a combination of treatments, minute 12 |
| heart: pulmonic | Only compression noise. No spontaneous heart sounds. | after a combination of treatments, minute 8 |
| heart: tricuspid | No heart sounds are heard. | after a combination of treatments, minute 12 |
| heart: tricuspid | Only compression noise. No spontaneous heart sounds. | after a combination of treatments, minute 8 |
| heart: mitral | No heart sounds are heard. | after a combination of treatments, minute 12 |
| heart: mitral | Only compression noise. No spontaneous heart sounds. | after a combination of treatments, minute 8 |
| lungs: upper | No breath sounds. | after a combination of treatments, minute 12 |
| lungs: upper | Breath sounds are heard only with each bag-mask breath. | after a combination of treatments, minute 12 |
| lungs: lower | No breath sounds. | after a combination of treatments, minute 12 |
| lungs: lower | Breath sounds are heard only with each bag-mask breath. | after a combination of treatments, minute 12 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| He is unresponsive. | after a combination of treatments, minute 12 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.12 | 1 | 1 | 1 | 0 | false | false | anterior-apex | No organized cardiac contraction: the heart is quivering. No pericardial effusion. | after a combination of treatments, minute 12 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: no | after a combination of treatments, minute 12 |
| blue lips: no | after a combination of treatments, minute 12 |
| neck veins distended: no | after a combination of treatments, minute 12 |
| leg swelling: no | after a combination of treatments, minute 12 |
| labored breathing: no | after a combination of treatments, minute 12 |
| distressed face: no | after a combination of treatments, minute 12 |
| oxygen mask: none | after a combination of treatments, minute 12 |
| IV line: no | after a combination of treatments, minute 12 |
| defibrillator pads: no | after a combination of treatments, minute 12 |
| pericardial drain: no | after a combination of treatments, minute 12 |
| died: yes | after a combination of treatments, minute 12 |
| blue lips: yes | after a combination of treatments, minute 10 |
| died: no | after a combination of treatments, minute 10 |
| IV line: yes | after a combination of treatments, minute 11 |
| oxygen mask: o2 | after a combination of treatments, minute 12 |
| defibrillator pads: yes | after a combination of treatments, minute 12 |
| oxygen mask: niv | after a combination of treatments, minute 12 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| normal | after a combination of treatments, minute 12 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the aortic site: heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the pulmonic site: heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the tricuspid site: heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the mitral site: heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the upper site: heart: none, lungs: none | after a combination of treatments, minute 12 |
| at the lower site: heart: none, lungs: none | after a combination of treatments, minute 12 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)

## Hypertensive Emergency (HTN-701)

**Categories:** Hypertension. **Chief complaints:** Headache, Blurred vision, Shortness of breath.

**Patient:** 52-year-old man with a severe headache, blurred vision and breathlessness. His blood pressure is dangerously high.

### Probandus and handover

| Item | Value |
| --- | --- |
| Age and sex | 52-year-old man |
| Bay | 1 |
| Triage | level 2: Emergent |
| Posture | reclined |
| Handover | Paramedic handover: 52-year-old man with a severe headache, blurred vision and breathlessness since yesterday evening. Blood pressure 238 over 136, checked three times. He has high blood pressure and ran out of his tablets two weeks ago. Oxygen saturation 94%. No known allergies. |

### Starting state

| Vital | Value |
| --- | --- |
| Heart rate | 98 /min |
| Blood pressure | 238/136 mmHg |
| SpO2 | 94 % |
| Respiratory rate | 22 /min |
| Temperature | 36.9 C |
| Rhythm | sinus |
| Starting severity | 0.5 |

### Parameters (every number used by the simulation)

| Name | Value |
| --- | --- |
| startSeverity | 0.5 |
| growthPerMin | 0.005 |
| agentRelief | 0.012 |
| furosemideRelief | 0.004 |
| nitroRelief | 0.005 |
| nitroDurationMin | 40 |
| stableSeverity | 0.2 |
| stableSbp | 175 |
| overshoot.sbpDrop | 70 |
| overshoot.dbpDrop | 40 |
| overshoot.durationMin | 30 |
| overshoot.harm | 0.1 |
| harm.aspirin | 0.05 |
| harm.heparin | 0.08 |
| harm.fluids | 0.05 |
| harm.norepi | 0.1 |
| vitals.hr | [75, 46] |
| vitals.sbp | [100, 276] |
| vitals.dbp | [60, 152] |
| vitals.spo2 | [99, -10] |
| vitals.rr | [14, 16] |
| vitals.temp | [36.9, 0] |

### Rules

- Severity (0 to 1) rises by 0.005 per minute. The first IV blood-pressure drug lowers that by 0.012, furosemide by 0.004 and nitroglycerin by 0.005 for 40 minutes.
- Blood pressure follows severity (systolic 100 + 276 x severity, diastolic 60 + 152 x severity).
- A second IV blood-pressure drug adds 0.1 to severity and drops systolic pressure by 70 and diastolic by 40 mmHg for 30 minutes.
- The patient stabilizes when severity is 0.2 or less and systolic pressure is 175 or less. The patient dies when severity reaches 1.
- Aspirin adds 0.05, heparin 0.08, a fluid bolus 0.05 and norepinephrine 0.1 to severity.

### Treatments

| Treatment | Rating at start | Depends on state? | Why | Source |
| --- | --- | --- | --- | --- |
| Epinephrine IV | harmful | no | Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Defibrillate (unsynchronized shock) | harmful | no | An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Adenosine rapid IV push | harmful | no | Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Start chest compressions (CPR) | harmful | no | Chest compressions on a patient who has a pulse can injure them and are not indicated. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Labetalol IV | helpful | yes, see Parameters | Labetalol lowers the pressure gradually. The aim is to fall by no more than 25% in the first hour. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Nicardipine IV infusion | helpful | yes, see Parameters | Nicardipine lowers the pressure gradually. The aim is to fall by no more than 25% in the first hour. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Nitroglycerin sublingual | helpful | no | Nitroglycerin lowers the pressure and eases the pulmonary edema. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Furosemide 40 mg IV | helpful | no | A loop diuretic treats the early pulmonary edema. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Aspirin 325 mg, chewed | harmful | no | An antiplatelet drug before a brain bleed is excluded can make a bleed worse. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Heparin IV (anticoagulation) | harmful | no | Anticoagulation raises the risk of bleeding into the brain when the pressure is this high. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| IV fluid bolus 500 mL | harmful | no | Fluid adds to the load on the heart and lungs. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Norepinephrine infusion | harmful | no | A vasopressor raises a pressure that is already dangerously high. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Oxygen by mask | neutral | no | His oxygen saturation is 94%, so oxygen is not needed. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |

Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."

### Examination findings (every different finding the case can produce)

Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.

| Exam | Finding | First seen |
| --- | --- | --- |
| General inspection | Anxious and restless with a severe headache, a little confused, sweaty. No facial droop and he moves all four limbs. | after a combination of treatments, minute 18 |
| General inspection | Drowsy and confused, sweaty, with a severe headache. He does not follow commands reliably. | after a combination of treatments, minute 35 |
| General inspection | Still restless, but the headache is starting to ease as the pressure falls. | after a combination of treatments, minute 20 |
| General inspection | Calmer. The headache is easing and he is alert. | after a combination of treatments, minute 39 |
| General inspection | Drowsy, cold and pale after the pressure fell too fast. | after a combination of treatments, minute 72 |
| Listen to the heart | Fast, regular. A loud second heart sound and a fourth heart sound. No murmur. | after a combination of treatments, minute 18 |
| Listen to the heart | Regular at about 85/min. The second heart sound is softer as the pressure falls, and the fourth heart sound is still there. | after a combination of treatments, minute 39 |
| Listen to the lungs | Fine crackles at both bases. | after a combination of treatments, minute 18 |
| Listen to the lungs | The crackles are fewer and confined to the lowest part of both bases. | after a combination of treatments, minute 25 |
| Listen to the lungs | Clear on both sides. | after a combination of treatments, minute 20 |
| Check neck veins (JVP) | Neck veins are not raised. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Strong, bounding pulses, equal in both arms and both legs. | after a combination of treatments, minute 18 |
| Check pulses and perfusion | Strong, regular pulses, equal in both arms and both legs. Less bounding than before. | after a combination of treatments, minute 39 |
| Check pulses and perfusion | Thin, weak pulses and cool hands after the pressure fell too fast. | after a combination of treatments, minute 72 |

### Test results (every different result the case can produce)

| Test | Result | First seen |
| --- | --- | --- |
| 12-lead ECG | Sinus rhythm 101/min. Left ventricular hypertrophy with a strain pattern. | after a combination of treatments, minute 18 |
| Troponin | Troponin I 0.09 ng/mL (normal below 0.04), a small leak from the strained heart. | after a combination of treatments, minute 18 |
| BNP | BNP 380 pg/mL, raised. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 3.9, sodium 140, creatinine 2.1 mg/dL. The kidneys are injured. | after a combination of treatments, minute 18 |
| Electrolytes and creatinine | Potassium 3.9, sodium 140, creatinine 1.9 mg/dL. The kidneys are recovering as the pressure comes down. | after a combination of treatments, minute 20 |
| Electrolytes and creatinine | Potassium 3.9, sodium 140, creatinine 2.5 mg/dL. The kidneys are worse after the pressure fell too fast. | after a combination of treatments, minute 72 |
| Chest X-ray | Mild cardiomegaly and early pulmonary edema. The aortic outline is normal. | after a combination of treatments, minute 18 |
| Chest X-ray | Mild cardiomegaly. The pulmonary edema is clearing. The aortic outline is normal. | after a combination of treatments, minute 25 |
| Bedside echocardiogram | Thickened left ventricular walls with good pumping, ejection fraction about 60%. Mildly enlarged left atrium. No pericardial effusion. | after a combination of treatments, minute 18 |

### Results that stay the same after correct treatment, and why

Every other examination finding, test result and listening site changes as the patient responds to treatment. These stay the same because physiology says they should.

| Result | Why it does not change |
| --- | --- |
| Examination: Check neck veins (JVP) | The neck veins are never raised in this case: the problem is pressure, not fluid overload of the right heart. |
| Test: 12-lead ECG | The left ventricular hypertrophy and strain pattern persist: This comes from ten years of high blood pressure and does not change in minutes. |
| Test: Troponin | The small troponin leak is from the strained heart and does not change in minutes. |
| Test: BNP | BNP is raised from the strained heart and falls over days, not minutes. |
| Test: Bedside echocardiogram | The thickened heart muscle persists: This comes from ten years of high blood pressure and does not change in minutes. |
| Listening site: heart pulmonic | Nothing is heard at the pulmonic area in any state of this case. |
| Listening site: heart tricuspid | Nothing is heard at the lower left sternal edge in any state of this case. |
| Listening site: heart mitral | The fourth heart sound persists: This comes from ten years of high blood pressure and does not change in minutes. |
| Listening site: lungs upper | The upper lungs stay clear in every state of this case: the fluid sits at the bases. |

### Exams and tests rated helpful

| Action | Why | Source |
| --- | --- | --- |
| 12-lead ECG | The ECG shows the strain on the heart and excludes a heart attack as the cause. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| General inspection | A brief neurological check shows whether the brain is affected. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Electrolytes and creatinine | Creatinine shows kidney injury, which is part of the diagnosis. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Chest X-ray | The X-ray shows pulmonary edema and checks the aorta. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Troponin | Troponin shows whether the heart is also being injured. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |

### Key actions (scored)

| Key action | Satisfied by | Weight | Deadline (min) | Why | Source |
| --- | --- | --- | --- | --- | --- |
| Get a 12-lead ECG | 12-lead ECG | 10 | 10 | It shows heart strain and excludes a heart attack. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Start one IV blood-pressure drug (labetalol or nicardipine) | Labetalol IV or Nicardipine IV infusion | 35 | 20 | A single IV drug lowers the pressure gradually. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Check his neurological state | General inspection | 10 | 10 | It shows whether the brain is affected. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Check kidney function and electrolytes | Electrolytes and creatinine | 10 | 30 | Kidney injury is part of the diagnosis. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Get a chest X-ray | Chest X-ray | 10 | 30 | It shows pulmonary edema. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Treat the pulmonary edema (furosemide or nitroglycerin) | Furosemide 40 mg IV or Nitroglycerin sublingual | 15 | 30 | The lungs are filling with fluid. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |
| Check troponin | Troponin | 10 | 30 | It shows whether the heart is injured. | 2017 ACC/AHA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults |

### History answers (spoken by the patient)

| Topic | Answer | First seen |
| --- | --- | --- |
| complaint | My head is pounding and my vision is blurry. | after a combination of treatments, minute 18 |
| onset | Since yesterday evening. It got worse today. | after a combination of treatments, minute 18 |
| severity | The headache is a 9 out of 10. | after a combination of treatments, minute 18 |
| location | All over my head, worst at the back. | after a combination of treatments, minute 18 |
| vision | Everything is blurry. | after a combination of treatments, minute 18 |
| neuro | I feel muddled, but I can move everything. | after a combination of treatments, minute 18 |
| breathless | Yes, a bit, especially lying down. | after a combination of treatments, minute 18 |
| nausea | I have vomited once. | after a combination of treatments, minute 18 |
| prior | My pressure has been high before, but never this high. | after a combination of treatments, minute 18 |
| pmh | High blood pressure for ten years. | after a combination of treatments, minute 18 |
| meds | Amlodipine and lisinopril. | after a combination of treatments, minute 18 |
| adherence | I ran out two weeks ago. I could not afford the refill. | after a combination of treatments, minute 18 |
| allergies | None. | after a combination of treatments, minute 18 |
| family | Both my parents had strokes. | after a combination of treatments, minute 18 |
| social | I smoke. No cocaine or other drugs. Two coffees a day. | after a combination of treatments, minute 18 |
| lastmeal | Breakfast. | after a combination of treatments, minute 18 |

### What you hear at each listening site

The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.

| Site | Finding | First seen |
| --- | --- | --- |
| heart: aortic | A loud second heart sound at the aortic area. No murmur. | after a combination of treatments, minute 18 |
| heart: aortic | The second heart sound is softer at the aortic area as the pressure falls. No murmur. | after a combination of treatments, minute 39 |
| heart: pulmonic | Normal sounds. No murmur. | after a combination of treatments, minute 18 |
| heart: tricuspid | Normal sounds. No murmur. | after a combination of treatments, minute 18 |
| heart: mitral | A fourth heart sound at the apex. No murmur. | after a combination of treatments, minute 18 |
| lungs: upper | Clear in the upper zones. | after a combination of treatments, minute 18 |
| lungs: lower | Fine crackles at both bases. | after a combination of treatments, minute 18 |
| lungs: lower | Fine crackles at the lowest part of both bases only. | after a combination of treatments, minute 25 |
| lungs: lower | Clear at the bases. | after a combination of treatments, minute 20 |

### What the patient says (every line)

| Line | First seen |
| --- | --- |
| My head is pounding and I cannot see properly. | after a combination of treatments, minute 18 |
| I cannot think straight... | after a combination of treatments, minute 35 |
| The headache is much better. | after a combination of treatments, minute 39 |

### Echocardiogram (every state the case can show)

Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).

| Ejection fraction | LV size | LA size | Wall thickness | Effusion | RV collapse | Mitral regurgitation | Weak wall | Caption | First seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.6 | 1 | 1.2 | 1.5 | 0 | false | false | none | Thickened left ventricular walls with good pumping, ejection fraction about 60%. Mildly enlarged left atrium. No pericardial effusion. | after a combination of treatments, minute 18 |

### What the patient looks like (every feature the case can show)

Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.

| Feature | First seen |
| --- | --- |
| sweating: yes | after a combination of treatments, minute 18 |
| blue lips: no | after a combination of treatments, minute 18 |
| neck veins distended: no | after a combination of treatments, minute 18 |
| leg swelling: no | after a combination of treatments, minute 18 |
| labored breathing: yes | after a combination of treatments, minute 18 |
| distressed face: yes | after a combination of treatments, minute 18 |
| oxygen mask: none | after a combination of treatments, minute 18 |
| IV line: no | after a combination of treatments, minute 18 |
| defibrillator pads: no | after a combination of treatments, minute 18 |
| pericardial drain: no | after a combination of treatments, minute 18 |
| died: no | after a combination of treatments, minute 18 |
| IV line: yes | after a combination of treatments, minute 11 |
| defibrillator pads: yes | after a combination of treatments, minute 26 |
| oxygen mask: o2 | after a combination of treatments, minute 62 |
| sweating: no | after a combination of treatments, minute 82 |
| labored breathing: no | after a combination of treatments, minute 82 |
| distressed face: no | after a combination of treatments, minute 82 |
| died: yes | after a combination of treatments, minute 82 |
| oxygen mask: niv | after a combination of treatments, minute 74 |

### 12-lead ECG patterns this case shows

| Pattern | First seen |
| --- | --- |
| lvh-strain | after a combination of treatments, minute 18 |

### Sounds

These are synthesized approximations. Every combination the case can play:

| Sounds | First seen |
| --- | --- |
| heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the aortic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the pulmonic site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the tricuspid site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the mitral site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the upper site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| at the lower site: heart: normal, lungs: crackles | after a combination of treatments, minute 18 |
| heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the aortic site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the pulmonic site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the tricuspid site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the mitral site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the upper site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |
| at the lower site: heart: normal, lungs: clear | after a combination of treatments, minute 20 |

### Review decision

- [ ] Reviewed and accepted
- [ ] Changes needed (list below)
