# Resus bay UI and nine cases (v2 addendum)

This addendum extends `spec/simulator-v1.md`. Everything in v1 still applies unless a requirement below changes it. Where this addendum names a different behavior, this addendum wins.

## Objective
Make the simulator feel like standing at a resus bay. The learner sees the patient from the front, examines them with real tools at real body sites, talks to them to take a history, reads the bedside monitor, prints a 12-lead ECG, runs an echo, and treats. Findings sit next to the orders so results are read as soon as they are asked for. Version 2 adds five cases (cardiogenic shock, cardiac arrest, stable and unstable arrhythmia, hypertensive emergency) to the existing four. It remains a static site on GitHub Pages for medical students, residents and clinicians.

## Requirements

### Constraints
1. All v1 constraints still apply: web only, static, GitHub Pages, no backend, phone to desktop (360 px up), keyboard operable, Chrome, Edge and Firefox.
2. Fonts are served from the repository. The site makes no request to any other domain.
3. Every image, waveform and sound is generated in the browser, is labelled as simulated, and is original. No clinical image or recording from another product is used.
4. Clinical content added by this addendum (histories, answers, findings by body site, echo states, ECG morphology, alarm limits, triage levels) is drafted from public guidelines, is listed in `docs/clinical-content-review.md`, and carries the "not clinically reviewed" notice until the project owner reviews it.

### Layout
5. On a screen 1100 px wide or more, the bay has three bands from top to bottom. The station band holds the patient and tool tray on the left, and the bedside monitor and probandus card on the right. The instrument band holds the ECG printout and echo, shown only when used. The workbench band holds three panels side by side: Orders (examinations, tests and treatments), Findings, and History.
6. Findings are always beside the orders, never below them, on any screen 700 px wide or more. Between 700 px and 1099 px the workbench shows two columns with History below. Below 700 px everything stacks in this order: probandus, monitor, patient, tool tray, instruments, history, findings, orders.
7. When the monitor has scrolled out of view, a compact strip with heart rate, blood pressure, oxygen saturation and breathing rate stays at the top of the screen. It is hidden while the monitor is visible and is not announced to screen readers.
8. The case list is a department board: one row per case with bay number, age and sex, chief complaint, triage level written in words, a triage colour band, progress, and a favorite star. Rows are ordered by bay number when sorted by case number.

### The probandus
9. The patient is drawn from the front, semi-reclined or flat on a trolley as the case requires, with the head, neck, chest, arms and hands visible.
10. The patient's appearance follows the case: skin paler as severity rises, sweating, blue lips at low oxygen saturation, distended neck veins, leg swelling, labored breathing, a distressed face, closed eyes when unresponsive or dead.
11. Monitoring and treatment devices appear on the patient: ECG electrodes and leads, blood pressure cuff and finger oximeter from the start; an oxygen mask or BiPAP mask, an IV line, defibrillator pads, a pericardial drain and the ultrasound probe once used; rescuer hands doing chest compressions while CPR is running.
12. The probandus card shows age, sex, bay, triage level and the paramedic handover. A speech bubble shows what the patient says, which changes with their state. An unresponsive patient shows "The patient does not respond."

### Examination tools and body sites
13. A tool tray offers Look, Stethoscope, Hands, ECG machine and Ultrasound. Stethoscope and Hands are picked and then used on the body. Look, ECG machine and Ultrasound act at once.
14. Body sites are real buttons with accessible names: the face; the neck veins; the heart at the aortic, pulmonic, tricuspid and mitral (apex) areas; the lungs at the upper and lower zones of each side; and the wrist pulse.
15. Picking the stethoscope zooms the view to the chest and labels each listening site. Putting it down returns to the full view.
16. Pressing a site carries out the matching examination action at the usual cost. A stethoscope graphic appears at the site pressed.
17. What the learner hears depends on where they listen. A finding that is localized, for example a mitral murmur or a gallop at the apex, is reported at its own site. Other sites report normal sounds with a short hint that nothing abnormal is heard there. The simulated sound plays for the site pressed.
18. Every site also works from the keyboard (Tab to reach, Enter or Space to use). The full list of actions stays available as an alternative to the body.

### History taking
19. A History panel lets the learner ask questions. The learner types a question, or picks a suggested question. The answer appears in a chat transcript, spoken by the patient, or by the paramedic when the patient cannot speak.
20. A question is matched to a topic by its words (for example onset, severity, associated symptoms, past history, medicines, missed medicines, allergies, family history, smoking, alcohol and drugs, last meal, witnessed collapse). A question that matches no topic gets a polite "I'm not sure what you're asking" answer and costs no time.
21. Each question asked costs one minute in learning mode, like any action. In challenge mode time keeps running. A question is never refused for being irrelevant.
22. Each case has answers for its own history. Topics a case does not answer fall back to a plain default ("No, not that I have noticed", or "Nothing that I know of").
23. In the debrief, questions are grouped into one line, "History: N questions asked", and expanded on request. They do not change the score.

### Monitor, ECG and echo
24. The v1 monitor, 12-lead ECG printout and echo behave as before, with these additions. Alarms follow documented limits. When an alarm starts, the nurse says one line in the findings. Alarm sounds and the heartbeat beep are off until the learner turns them on.
25. The monitor and printout show every rhythm the nine cases use: sinus, atrial fibrillation, supraventricular tachycardia, ventricular tachycardia, ventricular fibrillation and asystole. The 12-lead shows the correct pattern for each case, including a wide-complex tachycardia, a narrow regular tachycardia, left ventricular hypertrophy with strain, and ventricular fibrillation.

### New actions
26. The action menu gains: chest compressions (CPR), defibrillation (unsynchronized shock), epinephrine, amiodarone, adenosine, a vagal maneuver, labetalol, nicardipine and dobutamine. Each has a time cost, and each is rated helpful, harmful or no effect for every case.
27. A treatment that is clearly unsafe when it is not indicated (epinephrine, defibrillation, adenosine, labetalol, nicardipine, CPR on a patient with a pulse) is rated harmful and worsens the patient in the four v1 cases and in any new case that does not list it as indicated.

### New cases
28. Version 2 adds five cases. Each has a handover, a history, findings at each body site, a win path, a loss path, a harmful action, scored key actions that add up to 100, and a place on the board.
    - **Cardiogenic shock:** low blood pressure and pulmonary edema after a large heart attack. Pressors and an inotrope buy time, and opening the artery ends the case. Fluids, nitrates and beta-blockers are harmful.
    - **Cardiac arrest (ventricular fibrillation):** no pulse on arrival. Start compressions, shock, give epinephrine, shock again, then amiodarone. A pulse returns on the second shock if compressions are running and epinephrine has been given. Tests and a synchronized shock waste time.
    - **Stable supraventricular tachycardia:** a fast, regular, narrow tachycardia with a normal blood pressure. A vagal maneuver comes first and does not convert. Adenosine converts. Epinephrine and an unsynchronized shock are harmful.
    - **Unstable ventricular tachycardia with a pulse:** wide-complex tachycardia with low blood pressure and confusion. A synchronized shock is the first treatment. Without amiodarone the tachycardia returns after about 12 minutes. Diltiazem, metoprolol, adenosine and an unsynchronized shock are harmful.
    - **Hypertensive emergency:** severe blood pressure with headache, blurred vision and early pulmonary edema. One IV blood-pressure drug lowers it steadily. A second drug on top drops it too fast and is harmful, as are aspirin and heparin before a bleed is excluded.
29. The board lists all nine cases with nine bays. The case search finds every new case by name, category, chief complaint, number and `PREFIX-number`.

### The orders panel
32. The Orders panel, headed "What do you do?", is a disclosure. It is closed when a case starts and after "Play again", and it opens only when the learner presses its heading. Pressing the heading again closes it. It works by mouse, touch and keyboard (Enter and Space), and the heading can be reached with the Tab key.
33. Closed, the panel is a compact heading at least 44 px tall. Opening it grows the panel downward and does not move anything else. Findings stay beside it while it is closed and while it is open.
34. Nothing the learner needs is hidden inside the closed panel. The tools, the body sites and the history chat work without opening it, and every result, including sound messages, appears in Findings.
35. Whether the panel is open is not remembered. A new case, or a replay, starts with it closed.

### Findings that follow treatment
36. Every examination finding, test result and listening-site finding reflects the patient's current state, including the response to each treatment given. A treatment that helps improves the findings, a harmful treatment worsens them, and a patient left untreated shows them getting worse. Findings are never baseline data only.
37. A finding may stay the same after correct treatment only when physiology says it should, for example a normal troponin in a rhythm problem. Each such finding is listed with its reason in `docs/clinical-content-review.md`. Findings that the clinical picture says must change are not listed.
38. Test results that follow a trend change with time: troponin rises while a heart attack is open, and lactate falls once circulation is restored.
39. The echo result in the findings is the same text as the caption on the live ultrasound screen, so the written result and the picture always agree.

### Accessibility and motion
30. All v1 accessibility requirements still apply. In addition: every body site and tool has an accessible name, the chat is a labelled live region with a labelled input, and the ECG printout and echo keep their text equivalents.
31. With reduced motion requested, the printout appears at once and breathing, sweating, compressions and flashing alarms are not animated.

## Edge Cases
- **Asking a question the patient cannot answer:** for an unresponsive patient the paramedic answers from the handover. For a topic with no answer, the default is used.
- **Asking while paused, or after the case has ended:** the input is disabled and says why.
- **Empty or whitespace-only question:** nothing is sent.
- **A very long question:** it is accepted up to 200 characters and the rest is ignored.
- **A question matching two topics:** the more specific topic wins, and the order is fixed.
- **Listening at a site that has no special finding:** the learner hears normal sounds, and the finding is not marked as missed.
- **Listening at every site:** repeated listening is allowed. Only the first listening is rated helpful, as in v1.
- **Stethoscope picked, then Escape or a second press on the tool:** the stethoscope is put down and the view returns to normal.
- **Zoomed chest view on a phone:** the sites are still large enough to press, and the page does not scroll sideways.
- **Cardiac arrest:** heart rate and blood pressure read zero, the alarm names them, and heart and lung sounds are silent. The learner is told no sound is heard, not "Sounds are muted".
- **CPR running:** the rescuer's hands animate until a pulse returns or the case ends.
- **Patient dies:** the monitor shows no pulse, the patient looks dead, and the history input is disabled.
- **Monitor not on screen at 360 px:** the compact vitals strip appears and does not cause sideways scrolling.
- **The vitals strip appearing or disappearing:** it never changes the height of the page or moves any content.
- **Orders panel closed while the case is paused or has ended:** it can still be opened to read, but the buttons inside are disabled.
- **Giving the same treatment again:** the findings do not change a second time for the same cause, and a harmful treatment given twice worsens the patient twice.
- **A finding that changes only in one site:** the other sites keep their own findings (for example a gallop at the apex, nothing at the aortic area).
- **Pressing Finish case several times quickly:** one debrief and one recorded attempt.
- **A web address that names an unknown case or mode:** the board is shown.

## Definition of Done
- [ ] All nine cases can be played from the board to the debrief in both modes, with a win and a loss, on the live site.
- [ ] Findings are beside the orders at 1280 px and 800 px, and the stack order below 700 px matches requirement 6.
- [ ] The patient is drawn from the front, and each of the 11 body sites can be pressed by mouse and by keyboard.
- [ ] Picking the stethoscope zooms to the chest and labels the sites. At least one finding in the v1 and new cases is heard only at its own site, and the other sites say so.
- [ ] A learner can take a history by typing and by suggested questions in every case. The paramedic answers in the cardiac arrest case. An unknown question is answered politely and costs no time.
- [ ] The debrief groups the history questions into one expandable line.
- [ ] CPR, defibrillation, epinephrine, amiodarone, adenosine, the vagal maneuver, labetalol, nicardipine and dobutamine can each be given, and each shows its device or effect.
- [ ] The cardiac arrest case reaches a pulse on the second shock only with CPR running and epinephrine given, and stays in ventricular fibrillation otherwise.
- [ ] The monitor and 12-lead show the right rhythm and pattern for all nine cases.
- [ ] `npm test` passes, with new tests for history matching, body-site findings, the new actions, every new case, and the 12-lead patterns.
- [ ] `docs/clinical-content-review.md` lists every new history answer, finding by body site, echo state, ECG pattern, alarm limit and triage level. A test fails if it is out of date.
- [ ] "What do you do?" is closed when every case starts, opens only when its heading is pressed (mouse and keyboard), and is closed again after Play again and in a new case.
- [ ] With the panel closed, the tools, body sites, history chat and findings all work, and the sound message is visible.
- [ ] For every case, each examination finding, test result and listening-site finding either differs between the start and the recovered patient, or is listed with a reason in the review file. A test enforces this.
- [ ] For each treatment in a table of responses (for example furosemide in heart failure, drainage in tamponade, the cath lab in STEMI), the findings the treatment should change do change. A test enforces this.
- [ ] A patient left untreated, and a patient given a harmful treatment, show worse findings, not only worse vital signs.
- [ ] A fuzz test of random sessions in every case and both modes finds no impossible vital signs, no ended case that changes, and no text containing `undefined` or `NaN`.
- [ ] A random-input test of the screens finds no script error, no sideways scroll and no executed or rendered markup from typed questions.
- [ ] Case timers and document listeners are released when a case ends or is left.
- [ ] The accessibility scan reports no violations on the board, intro, play (with ECG, echo and chat in use) and debrief screens, at 1100 px and 360 px.
- [ ] No page scrolls sideways at 360 px, with the printout, echo and chat open.
- [ ] No request goes to any domain other than the site's own.
- [ ] The site is deployed from `main`, and the live URL serves the finished version.
