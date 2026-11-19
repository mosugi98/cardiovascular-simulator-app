# Cardiovascular Simulator App

A browser-based cardiovascular emergency simulator for medical students, residents and clinicians. Pick a case, read the monitor, examine the patient, order tests, give treatments, and review a scored debrief.

**Educational demo. The clinical content is drafted from public guideline names and has not been clinically reviewed. Do not use it for real patient care.**

Live site: https://mosugi98.github.io/cardiovascular-simulator-app/

## Cases (nine bays)

- Hypertensive emergency
- Cardiac arrest (ventricular fibrillation)
- Cardiogenic shock
- Cardiac tamponade
- Acute decompensated heart failure
- Unstable ventricular tachycardia with a pulse
- Stable supraventricular tachycardia
- Atrial fibrillation with rapid ventricular response
- Anterior STEMI

## Modes

- **Learning:** turn-based. Time moves only when you act, and each action costs minutes.
- **Challenge:** real-time. A clock runs and the patient changes while you decide. You can pause.

## The bay

- **Layout:** the patient and tools sit on the left of the station, the monitor and probandus card on the right. The ECG printout and echo appear in a band below. The workbench below has "What do you do?", Findings and History side by side (on a phone everything stacks). "What do you do?" is the full list of actions, and it stays closed until you open it: the tool tray, the body sites and the history chat work without it.
- **Findings follow your treatment:** every examination, test and listening-site result reads the patient's current state. Give furosemide and the crackles retreat, the neck veins drop and the chest X-ray clears. Drain a tamponade and the heart sounds, pulse, ECG and echo all change. Leave a patient alone, or harm them, and the findings get worse. Tests that follow a trend, such as troponin, change with time. A few results stay the same on purpose, for example a normal troponin in a rhythm problem, and `docs/clinical-content-review.md` says why.
- **Probandus:** the patient lies in a bed, seen from the front. They look worse as they deteriorate (paler, sweating, blue lips, neck veins, swollen legs, labored breathing), and what they say changes.
- **Body sites:** 11 real buttons: face, neck veins, the four heart areas (aortic, pulmonic, tricuspid, mitral/apex), four lung zones and the wrist. Pick the stethoscope and the view zooms to the chest and labels each listening site. What you hear depends on where you listen: a gallop is heard at the apex only.
- **Tool tray:** Look, Stethoscope, Hands, ECG machine and Ultrasound. The full list of actions is still available, and every body site works from the keyboard.
- **History:** talk to the patient (or the paramedic, when the patient cannot speak). Type a question or pick a suggested one. Each question costs a minute in learning mode. History is not scored, and the debrief groups it into one line.
- **Bedside monitor:** vitals, ECG, a pulse wave, alarms (with a nurse calling them out), an optional heartbeat beep, and silence alarms.
- **12-lead ECG:** prints out on ECG paper with the right morphology in every lead (ST elevation, low voltage with alternans, LBBB, pericarditis, AF).
- **Echo:** a live simulated apical four-chamber view that changes with the patient (for example, draining a tamponade).
- **Devices appear as you treat:** oxygen and BiPAP masks, IV line, defibrillator pads, a pericardial drain and the ultrasound probe.

All images and sounds are simulated in the browser and labelled as such. The fonts (Atkinson Hyperlegible) are served from `fonts/`, so the site makes no requests to Google.

Wrong or harmful actions are allowed and really worsen the patient. The debrief shows an outcome, a score, and a timeline marking each action helpful, harmful or no effect, plus the key actions you missed.

Leaving the page, refreshing, or switching tabs during a case restarts it from the beginning.

## Progress

Completed cases, best scores and favorites are saved in your browser only (no accounts, no server). Use **Export progress** and **Import progress** to move them between devices.

## Run it

It is a static site with no build step. Serve the folder with any static server (ES modules do not load from `file://`):

```
npm start
```

```
npm test            # unit tests (engine, scoring, search, progress, review file)
npm run review:gen  # regenerate docs/clinical-content-review.md
```

## Layout

- `index.html`, `styles.css`: the page
- `src/engine/`: simulation engine, action catalog, scoring
- `src/cases/`: the four cases (data and rules)
- `src/search/caseSearch.js`: case search (substring, case number, `PREFIX-123`, filters, sort)
- `src/ui/`: screens, ECG renderer, synthesized sounds
- `src/storage/progress.js`: browser storage, export and import
- `docs/clinical-content-review.md`: every clinical value and rule with its source, for review (generated)
- `spec/simulator-v1.md`: the first specification, and `spec/ui-v2.md`, the addendum for the resus bay UI and the nine cases

Heart and lung sounds are synthesized in the browser and labelled "simulated". No content, code or audio from any other simulator is used.
