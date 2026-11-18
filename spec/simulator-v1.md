# Simulator v1

## Objective
A browser-based cardiovascular emergency simulator for medical students, residents and clinicians. A learner picks a case, reads the patient's vitals, ECG and exam findings, orders tests and gives treatments, and watches the patient's condition change as a result. At the end they get an outcome, a score and a timeline debrief explaining what helped, what harmed and what was missed. Version 1 covers four cases and runs as a static site published from this GitHub repository, so anyone can play it with no install, account or backend.

## Requirements

### Constraints (boundaries the build must stay within)
1. Web only. The app is published to GitHub Pages from this repository's `main` branch.
2. Fully static: no backend, no accounts, no server-side storage, and no build step required to run it.
3. It must work on desktop and on phones, down to a 360 px wide viewport.
4. It must be fully operable by keyboard. State shown with color (for example abnormal vitals) must also be conveyed another way. The ECG must have a text equivalent.
5. It must work in current versions of Chrome, Edge, Firefox and Safari.
6. No content, code or audio from the Full Code Medical Simulation app may be used. All clinical content, text and sounds are original or openly licensed.
7. Clinical content is drafted by Claude from public guidelines and reviewed by the project owner afterwards. Until reviewed, the app must show a "not clinically reviewed" notice on every case.

### Cases
8. Version 1 includes exactly four playable cases: Anterior STEMI, Atrial fibrillation with rapid ventricular response, Cardiac tamponade, and Acute decompensated heart failure.
9. The existing case search module is reused for the case list: search by name, category, chief complaint, case number and `PREFIX-number`, with the clear button, Escape to clear, and the "No search results" state already built.
10. Each case has at least one winning path (patient stabilizes) and at least one losing path (patient dies or the case ends in failure).

### Play modes
11. Before starting a case, the learner chooses a mode:
    - **Learning mode:** turn-based. Time advances only when the learner takes an action, and each action costs a defined number of minutes.
    - **Challenge mode:** real-time. A running clock changes the patient's vitals continuously, so delays affect the patient.
12. Challenge mode has a visible clock and a Pause button.

### Patient monitor and examination
13. The monitor shows numeric vitals: heart rate, blood pressure, SpO2, respiratory rate and temperature. They update as the patient's state changes.
14. The monitor shows a live ECG waveform that reflects the current rhythm of the case (for example ST elevation in STEMI, an irregular rhythm in atrial fibrillation, low voltage in tamponade) and changes when the patient's rhythm changes.
15. The learner can perform examination steps (inspection, heart sounds, lungs, JVP, pulses). Each reveals text findings for the current patient state.
16. Heart and lung sounds are playable. They are synthesized in the browser, labelled "simulated", and reflect the current patient state. They do not use any recording from another product.

### Actions and patient response
17. The learner can order tests and give treatments from a menu. Each test returns a result consistent with the case and the current patient state.
18. Each action has a time cost (used in learning mode). Treatments that are indicated, and treatments that are harmful, change the patient's state. A treatment that is not indicated for the case may have no effect on the patient, and is shown as "no effect" in the debrief.
19. Harmful or contraindicated actions are allowed and really worsen the patient: vitals and rhythm deteriorate and the patient can die. The simulator does not block them. Examples: a nitrate in cardiac tamponade, or a beta-blocker in acutely decompensated heart failure.
20. A case ends when the patient stabilizes, when the patient dies, or when the learner chooses to finish.

### Debrief and scoring
21. When a case ends, the learner sees the outcome, a numeric score, and a timeline of every action they took.
22. Each action in the timeline is marked helpful, harmful or "no effect" (for an action that neither helps nor harms), with a short explanation. A key action the learner never took is listed as missed. Where an action's rating rests on a guideline, the guideline is shown with the explanation. An action rated "no effect" may have no guideline.

### Progress and storage
23. The app saves, in the browser only, the completed cases, best scores and favorite cases.
24. The learner can export that progress to a downloadable file and import it back, to move between devices.
25. A case in progress is not saved. See the interruption edge case.

### Clinical content review
26. The repository includes a clinical content review file that lists every clinical value, rule, drug effect and scoring rule used by each case, with the public guideline source for each, so the project owner can review it.

## Edge Cases
- **Refresh, close or switch away mid-case:** the case restarts from the beginning when the learner returns. Nothing from the interrupted run is saved or scored.
- **Challenge mode, patient dies before the learner acts:** the case ends with a loss and the debrief marks the missed key actions.
- **Harmful action:** the action is carried out, the patient worsens, and the debrief marks the action as harmful with an explanation.
- **Leaving a case right after the patient dies (Leave case or the browser Back button):** the learner goes where they chose. No debrief appears and no result is recorded for that run.
- **Repeating an action:** a repeated action is allowed and takes effect again, with its time cost. Anything that should not be repeated (for example a maximum drug dose) is handled by the content rules in requirement 26.
- **No saved progress yet:** the case list works and shows no completed cases or scores.
- **Browser storage unavailable or cleared:** the app still plays all cases. Progress is simply not remembered, and the learner is told so.
- **Importing an invalid or corrupted progress file:** the import is rejected with a clear message and existing saved progress is left unchanged.
- **Importing a valid file when progress already exists:** the learner is asked before existing progress is replaced.
- **Search with no matches:** "No search results" is shown.
- **Audio blocked by the browser until the learner interacts:** sounds start after the first interaction without an error, and the learner can mute them.
- **Phone, narrow viewport (360 px):** the monitor, ECG, exam, action menu and debrief remain usable with no horizontal page scroll.
- **Keyboard only:** every action, mode choice, pause, mute and export/import is reachable and operable without a mouse.

## Definition of Done
- [ ] All four cases (Anterior STEMI, atrial fibrillation with RVR, cardiac tamponade, acute decompensated heart failure) can be played from the case list to the debrief in both learning and challenge mode on the live GitHub Pages site.
- [ ] Each case has been played to a winning end and to a losing end, and both reach the debrief.
- [ ] Vitals, the ECG waveform, exam findings and simulated sounds all change when the patient's state changes.
- [ ] A harmful action in each case visibly worsens the patient and appears as "harmful" in the debrief.
- [ ] The debrief shows an outcome, a numeric score, and a timeline where each action is marked helpful, harmful or "no effect" with an explanation, and key actions never taken are listed as missed. Helpful and harmful actions show their guideline.
- [ ] Refreshing mid-case restarts the case.
- [ ] Progress (completed cases, best scores, favorites) is remembered in the browser. Export then import on a clean browser restores it. An invalid file is rejected without changing existing progress.
- [ ] Case search works as previously built, including the clear button, Escape, and the "No search results" state.
- [ ] `npm test` passes, with automated tests covering the simulation engine, scoring, search, and progress save/export/import.
- [ ] The clinical content review file exists and lists every clinical value and rule with its guideline source, including every different exam finding, test result and sound a case can produce as the patient's state changes. Every case shows the "not clinically reviewed" notice.
- [ ] Keyboard-only play works for a full case, and the layout works at 360 px width with no horizontal scroll. I have checked and reported both.
- [ ] No Full Code Medical Simulation content, code or audio is present in the repository.
- [ ] The site is deployed from `main` and the live URL serves the finished version.
