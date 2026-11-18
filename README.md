# Cardiovascular Simulator App

A browser-based cardiovascular emergency simulator for medical students, residents and clinicians. Pick a case, read the monitor, examine the patient, order tests, give treatments, and review a scored debrief.

**Educational demo. The clinical content is drafted from public guideline names and has not been clinically reviewed. Do not use it for real patient care.**

Live site: https://mosugi98.github.io/cardiovascular-simulator-app/

## Cases

- Anterior STEMI
- Atrial fibrillation with rapid ventricular response
- Acute decompensated heart failure
- Cardiac tamponade

## Modes

- **Learning:** turn-based. Time moves only when you act, and each action costs minutes.
- **Challenge:** real-time. A clock runs and the patient changes while you decide. You can pause.

## The bay

- **Probandus:** the patient lies on a trolley (SVG). They look worse as they deteriorate (paler, sweating, blue lips, neck veins, swollen legs, labored breathing), and what they say changes. Press a body zone to examine them: face, neck, chest (lungs and heart) and wrist.
- **Tool tray:** Look, Stethoscope, Hands, ECG machine and Ultrasound. The full list of actions is still on the right, and works from the keyboard.
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
- `spec/simulator-v1.md`: the specification this build follows

Heart and lung sounds are synthesized in the browser and labelled "simulated". No content, code or audio from any other simulator is used.
