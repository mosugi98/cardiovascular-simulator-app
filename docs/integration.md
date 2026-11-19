# Linking to and embedding the simulator

The simulator is a static site at **https://mosugi98.github.io/cardiovascular-simulator-app/**. Another app can link to it, or show it in a frame, without copying any code. The simulator keeps updating from this repository.

This page is written for the other app, for example CARDIO PPDS MASTER (`https://mosugi98.github.io/cv-mastery/`).

## Links to a case

Add one of these to the end of `https://mosugi98.github.io/cardiovascular-simulator-app/`. The `#/play/...` links start the case at once. The `#/case/...` links show the case and let the learner choose learning or challenge mode.

| Case | Choose a mode | Start in learning mode | Start in challenge mode |
|---|---|---|---|
| Hypertensive emergency | `#/case/hypertensive-emergency` | `#/play/hypertensive-emergency/learning` | `#/play/hypertensive-emergency/challenge` |
| Cardiac arrest | `#/case/cardiac-arrest` | `#/play/cardiac-arrest/learning` | `#/play/cardiac-arrest/challenge` |
| Cardiogenic shock | `#/case/cardiogenic-shock` | `#/play/cardiogenic-shock/learning` | `#/play/cardiogenic-shock/challenge` |
| Cardiac tamponade | `#/case/cardiac-tamponade` | `#/play/cardiac-tamponade/learning` | `#/play/cardiac-tamponade/challenge` |
| Acute decompensated heart failure | `#/case/adhf` | `#/play/adhf/learning` | `#/play/adhf/challenge` |
| Unstable ventricular tachycardia | `#/case/vt-unstable` | `#/play/vt-unstable/learning` | `#/play/vt-unstable/challenge` |
| Stable supraventricular tachycardia | `#/case/svt-stable` | `#/play/svt-stable/learning` | `#/play/svt-stable/challenge` |
| Atrial fibrillation with RVR | `#/case/afib-rvr` | `#/play/afib-rvr/learning` | `#/play/afib-rvr/challenge` |
| Anterior STEMI | `#/case/stemi-anterior` | `#/play/stemi-anterior/learning` | `#/play/stemi-anterior/challenge` |

The bare address (no `#`) shows the board of all nine patients. An address that names an unknown case or mode shows the board.

A case that is reloaded, or left and returned to, starts again from the beginning. Nothing about a case in progress is saved.

## A way back

Add `return` (and, optionally, `returnLabel`) before the `#`. The simulator then shows a "Back to ..." link at the top of every screen.

```
https://mosugi98.github.io/cardiovascular-simulator-app/?return=/cv-mastery/&returnLabel=CARDIO%20PPDS%20MASTER#/play/cardiac-arrest/learning
```

- `return` can only be an address **on the same site** as the simulator (`https://mosugi98.github.io`). An address anywhere else is ignored and no link is shown. This stops a crafted link from sending a learner to another site.
- `returnLabel` is plain text, at most 40 characters. If it is missing the link reads "Back to the previous page".
- Inside a frame the link opens in the whole window, not inside the frame.

## Showing it in a frame

```html
<iframe
  src="https://mosugi98.github.io/cardiovascular-simulator-app/#/play/cardiac-arrest/learning"
  title="Cardiac arrest simulator"
  loading="lazy"
  style="width: 100%; height: 900px; border: 0;"
  sandbox="allow-scripts allow-same-origin allow-downloads allow-forms">
</iframe>
```

- GitHub Pages does not block framing, and the simulator does not either.
- Give the frame room: the play screen is tall and scrolls inside the frame. About 900 px high works on a desktop. On a phone, a link that opens the simulator in its own page is a better experience than a frame.
- If you use `sandbox`, keep `allow-scripts` and `allow-same-origin`. Without `allow-same-origin` the browser blocks the simulator's storage. It still plays, but shows a notice and cannot remember progress. `allow-downloads` lets the learner export their progress.
- The simulator needs the internet. If your app works offline, show a fallback when it is offline, for example:

```html
<div id="sim"></div>
<script>
  const sim = document.getElementById('sim');
  sim.innerHTML = navigator.onLine
    ? '<iframe src="https://mosugi98.github.io/cardiovascular-simulator-app/#/play/cardiac-arrest/learning" title="Cardiac arrest simulator" style="width:100%;height:900px;border:0"></iframe>'
    : '<p>The simulator needs an internet connection. Everything else here still works offline.</p>';
</script>
```

## Storage and privacy

The two apps share one origin, so they share browser storage. The simulator writes only one key, `csa.progress.v1` (completed cases, best scores and favorites, on this device only). Keep that name free in your app. Nothing is sent to any server by either app.

The simulator makes no request to any other domain: its fonts are served from its own folder.

Because the two sites share an origin, either app's code can read the other's stored data. Both are yours, so this is normally fine. If you ever host something you do not control next to them, move one of them to its own address.

## Educational use

Every screen of the simulator carries a notice that its clinical content has not been clinically reviewed and is not for patient care. Please keep that notice visible if you show the simulator inside another app.

## Checking the link works

1. Open the link in a private window. The case should start with the patient on screen.
2. If you used `return`, check the "Back to ..." link takes you to your app.
3. If you framed it, play a case and confirm there is no message about blocked storage.
