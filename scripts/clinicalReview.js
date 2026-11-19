import { CASES } from '../src/cases/index.js';
import { CATALOG } from '../src/engine/catalog.js';
import { createSim, perform, advance, MODES } from '../src/engine/sim.js';
import { SCORING } from '../src/engine/score.js';
import { CHALLENGE_SIM_MIN_PER_SEC } from '../src/engine/sim.js';
import { BASE_LEADS, ECG_PATTERNS, LEADS } from '../src/ui/ecg12.js';
import { ALARM_LIMITS } from '../src/ui/alarms.js';
import { sceneModel } from '../src/ui/patientScene.js';
import { INTENTS, answerFor, DEFAULT_ANSWER } from '../src/ui/history.js';

function flatten(obj, prefix = '') {
  const rows = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) rows.push(...flatten(v, key));
    else rows.push([key, Array.isArray(v) ? `[${v.join(', ')}]` : String(v)]);
  }
  return rows;
}

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (head, rows) => [
  `| ${head.join(' | ')} |`,
  `| ${head.map(() => '---').join(' | ')} |`,
  ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`),
].join('\n');

/**
 * Plays a case along many routes and records every different exam finding, test
 * result and sound it can produce, with the first situation that produced it.
 * Numbers are ignored when deciding whether two texts are the same, because vital
 * signs drift every minute.
 */
export function collectVariants(def) {
  const norm = (t) => String(t).replace(/\d+(\.\d+)?/g, '#');
  const exam = new Map();
  const tests = new Map();
  const sounds = new Map();
  const speech = new Map();
  const echo = new Map();
  const looks = new Map();
  const patterns = new Map();
  const ausc = new Map();
  const hist = new Map();
  const note = (store, id, key, text, when) => {
    if (!store.has(id)) store.set(id, new Map());
    if (!store.get(id).has(key)) store.get(id).set(key, { text, when });
  };

  const sample = (s, when) => {
    for (const [id, fn] of Object.entries(def.exam)) { const t = fn(s); note(exam, id, norm(t), t, when); }
    for (const [id, fn] of Object.entries(def.tests)) { const t = fn(s); note(tests, id, norm(t), t, when); }
    for (const area of [undefined, 'aortic', 'pulmonic', 'tricuspid', 'mitral', 'upper', 'lower']) {
      const snd = def.sounds(s, area);
      const label = `${area ? `at the ${area} site: ` : ''}heart: ${snd.heart}, lungs: ${snd.lungs}`;
      if (!sounds.has(label)) sounds.set(label, when);
    }
    for (const kind of ['heart', 'lungs']) {
      for (const [area, fn] of Object.entries(def.auscultation?.[kind] ?? {})) {
        const t = fn(s);
        note(ausc, `${kind}: ${area}`, norm(t), t, when);
      }
    }
    for (const id of Object.keys(def.history.answers)) {
      const t = answerFor(def, s, id).text;
      note(hist, id, norm(t), t, when);
    }
    const said = def.speech(s);
    if (!speech.has(norm(said))) speech.set(norm(said), { text: said, when });
    const e = def.echo(s);
    const ekey = echoLabel(e);
    if (!echo.has(ekey)) echo.set(ekey, { e, when });
    for (const f of lookFeatures(sceneModel(def, s))) if (!looks.has(f)) looks.set(f, when);
    if (s.ecg.pattern && !patterns.has(s.ecg.pattern)) patterns.set(s.ecg.pattern, when);
  };

  const route = (name, actions) => {
    const s = createSim(def, MODES.CHALLENGE);
    for (const id of actions) perform(def, s, id);
    for (let m = 0; m <= 200 && s.status === 'active'; m++) {
      sample(s, m === 0 ? `${name}, at the start` : `${name}, minute ${m}`);
      advance(def, s, 1);
    }
    sample(s, `${name}, when the case ended (${s.status})`);
  };

  route('with no treatment', []);
  route('after every key action', def.key.map((k) => k.ids[0]));
  // A learner can give any treatment on the menu, whether or not the case lists it.
  for (const id of Object.keys(CATALOG).filter((k) => CATALOG[k].kind === 'treat')) {
    route(`after ${CATALOG[id].label}`, [id]);
    if (id !== 'heparin') route(`after Heparin then ${CATALOG[id].label}`, ['heparin', id]);
  }
  return { exam, tests, sounds, speech, echo, looks, patterns, ausc, hist };
}

/** A stable text key for an echo state, and for how the patient looks. Exported for the tests. */
export function echoLabel(e) {
  return `ef ${e.ef}, lv ${e.lv}, la ${e.la}, wall ${e.wall}, effusion ${e.effusion}, rv collapse ${e.rvCollapse}, mitral regurgitation ${e.mr}, weak wall ${e.hypokinesis ?? 'none'}: ${e.caption}`;
}
export function lookFeatures(m) {
  const yn = (v) => (v ? 'yes' : 'no');
  return [
    `sweating: ${yn(m.sweat)}`, `blue lips: ${yn(m.cyanosis)}`, `neck veins distended: ${yn(m.jvp)}`, `leg swelling: ${yn(m.edema)}`,
    `labored breathing: ${yn(m.dyspnea)}`, `distressed face: ${yn(m.distress)}`, `oxygen mask: ${m.mask ?? 'none'}`, `IV line: ${yn(m.iv)}`,
    `defibrillator pads: ${yn(m.pads)}`, `pericardial drain: ${yn(m.drain)}`, `died: ${yn(m.dead)}`,
  ];
}

/** Builds docs/clinical-content-review.md from the case data, so it cannot drift from the code. */
export function buildReviewMarkdown() {
  const out = [];
  out.push('# Clinical content review');
  out.push('');
  out.push('This file is generated from the case data by `npm run review:gen`. Do not edit it by hand. A test fails if it is out of date.');
  out.push('');
  out.push('**Status: drafted by an AI model from public guideline names. NOT clinically reviewed.** The simulator is an educational demo and must not be used for real patient care.');
  out.push('');
  out.push('## How to review');
  out.push('');
  out.push('- Citations give the guideline name only. Section numbers and recommendation classes have **not** been checked.');
  out.push('- Every number below (vitals, rates, doses, effects, timings, weights) is an invented simulation value, not a measured clinical figure. Check that each one is plausible and teaches the right lesson.');
  out.push('- "Severity" is a hidden number from 0 (well) to 1 (death) that drives the vital signs. Vital signs follow it as `value = a + b x severity` and drift toward that target with a lag of about 3 minutes.');
  out.push('- Mark each case reviewed or list the changes needed.');
  out.push('');
  out.push('## Time and scoring rules');
  out.push('');
  out.push(`- Learning mode is turn-based. Each action advances the clock by its cost (see each action's minutes below).`);
  out.push(`- Challenge mode is real-time. ${CHALLENGE_SIM_MIN_PER_SEC} simulated minutes pass per real second (5 seconds = 1 minute). Action costs are not applied.`);
  out.push(`- Key actions are worth ${SCORING.keyActionPoints} points in total, split by each key action's weight. On time = full weight, late (after its deadline) = ${SCORING.lateFactor * 100}%, missed = 0.`);
  out.push(`- A stabilized patient earns ${SCORING.outcomePoints} points. Any other outcome earns 0.`);
  out.push(`- Each harmful action costs ${SCORING.harmPenaltyEach} points, up to ${SCORING.harmPenaltyMax} in total.`);
  out.push('- Score = key points + outcome points - harm penalty, rounded and kept between 0 and 100.');
  out.push('- A repeated helpful treatment is rated "no effect". Only the first two fluid boluses in tamponade count as helpful.');
  out.push('- Examinations and tests are rated helpful only if the case lists them as useful, and only the first time. Otherwise they are rated "no effect".');
  out.push('');
  out.push('## Shared action menu');
  out.push('');
  out.push(table(['Action', 'Type', 'Minutes (learning mode)'], Object.values(CATALOG).map((a) => [a.label, a.kind, a.cost])));

  out.push('');
  out.push('## History taking');
  out.push('');
  out.push('The learner types a question or picks a suggested one. The question is matched to a topic by its words, tried in this order so the more specific topic wins. A question that matches no topic gets the polite "not sure" answer and costs no time. Each question that is understood costs 1 minute in learning mode.');
  out.push('');
  out.push(table(['Topic', 'Suggested question'], INTENTS.map((i) => [i.id, i.ask])));
  out.push('');
  out.push(`Topics a case does not answer fall back to "${DEFAULT_ANSWER.symptom}" for symptoms and "${DEFAULT_ANSWER.history}" for past history. A question that is not understood gets: "${DEFAULT_ANSWER.unknown}"`);

  out.push('');
  out.push('## Monitor alarms and nurse call-outs');
  out.push('');
  out.push('The bedside monitor raises an alarm when a vital sign passes a limit. The nurse says one line when an alarm starts.');
  out.push('');
  const L = ALARM_LIMITS;
  out.push(table(['Alarm', 'Limit', 'Urgent when', 'Nurse says'], [
    ['Heart rate high', `above ${L.hrHigh}/min`, `above ${L.urgent.hrAbove}/min`, 'Heart rate is N.'],
    ['Heart rate low', `below ${L.hrLow}/min`, `below ${L.urgent.hrBelow}/min`, 'Heart rate has dropped to N.'],
    ['Blood pressure low', `systolic below ${L.sbpLow} mmHg`, `systolic below ${L.urgent.sbpBelow} mmHg`, 'Pressure is N over N.'],
    ['Oxygen low', `SpO2 below ${L.spo2Low}%`, `SpO2 below ${L.urgent.spo2Below}%`, 'Sats are down to N%.'],
    ['Breathing rate high', `above ${L.rrHigh}/min`, 'never urgent', 'Breathing at N.'],
  ]));
  out.push('');
  out.push('Vital-sign flags on the monitor tiles: heart rate Low below 60 and High above 100; systolic pressure Low below 90 and High at 140 or more; SpO2 Low below 92%; breathing rate Low below 12 and High above 20; temperature Low below 36 and High above 38.');

  out.push('');
  out.push('## 12-lead ECG morphology');
  out.push('');
  out.push('Each lead is built from P, Q, R, S and T waves (heights in mV; 1 mV is 10 mm on the paper), a J-point ST offset and a PR-segment offset. The printout shows 10 seconds at 25 mm/s and 10 mm/mV. Leads are drawn in the usual four columns of three, with a lead II rhythm strip.');
  out.push('');
  out.push('Normal values for each lead:');
  out.push('');
  out.push(table(['Lead', 'P', 'Q', 'R', 'S', 'T', 'ST', 'PR'], LEADS.map((l) => {
    const b = BASE_LEADS[l];
    return [l, b.p, b.q, b.r, b.s, b.t, b.st, b.pr];
  })));
  for (const [name, p] of Object.entries(ECG_PATTERNS)) {
    out.push('');
    out.push(`### ECG pattern: ${name}`);
    out.push('');
    out.push(p.label);
    out.push('');
    out.push(`QRS width factor: ${p.width}.`);
    const overrides = Object.entries(p.leads);
    if (overrides.length) {
      out.push('');
      out.push(table(['Lead', 'Values that differ from normal (mV)'], overrides.map(([lead, v]) => [lead, Object.entries(v).map(([k, x]) => `${k} ${x}`).join(', ')])));
    }
  }

  for (const def of CASES) {
    const start = createSim(def, MODES.LEARNING);
    out.push('');
    out.push(`## ${def.name} (${def.prefix}-${def.caseNumber})`);
    out.push('');
    out.push(`**Categories:** ${def.categories.join(', ')}. **Chief complaints:** ${def.chiefComplaints.join(', ')}.`);
    out.push('');
    out.push(`**Patient:** ${def.patient}`);
    out.push('');
    out.push('### Probandus and handover');
    out.push('');
    out.push(table(['Item', 'Value'], [
      ['Age and sex', `${def.person.age}-year-old ${def.person.sex}`],
      ['Bay', def.person.bay],
      ['Triage', `level ${def.triage.level}: ${def.triage.label}`],
      ['Posture', def.person.pose],
      ['Handover', def.handover],
    ]));
    out.push('');
    out.push('### Starting state');
    out.push('');
    out.push(table(['Vital', 'Value'], [
      ['Heart rate', `${Math.round(start.vitals.hr)} /min`],
      ['Blood pressure', `${Math.round(start.vitals.sbp)}/${Math.round(start.vitals.dbp)} mmHg`],
      ['SpO2', `${Math.round(start.vitals.spo2)} %`],
      ['Respiratory rate', `${Math.round(start.vitals.rr)} /min`],
      ['Temperature', `${start.vitals.temp.toFixed(1)} C`],
      ['Rhythm', start.rhythm],
      ['Starting severity', start.severity],
    ]));
    out.push('');
    out.push('### Parameters (every number used by the simulation)');
    out.push('');
    out.push(table(['Name', 'Value'], flatten(def.params)));
    out.push('');
    out.push('### Rules');
    out.push('');
    for (const r of def.rules) out.push(`- ${r}`);
    out.push('');
    out.push('### Treatments');
    out.push('');
    out.push(table(['Treatment', 'Rating at start', 'Depends on state?', 'Why', 'Source'], Object.entries(def.treat).map(([id, t]) => {
      const r = t.rate ? t.rate(start) : t;
      return [CATALOG[id].label, r.rating, t.rate ? 'yes, see Parameters' : 'no', r.why, r.source];
    })));
    out.push('');
    out.push('Treatments not listed above are rated "no effect": "This treatment is not indicated here and has no major effect on this patient."');
    out.push('');
    const variants = collectVariants(def);
    const variantRows = (store) => [...store.entries()].flatMap(([id, byKey]) => [...byKey.values()].map((v) => [CATALOG[id].label, v.text, v.when]));
    out.push('### Examination findings (every different finding the case can produce)');
    out.push('');
    out.push('Numbers in a finding are examples, because vital signs change every minute. "First seen" is the first situation, in the routes played for this review, that produced the finding.');
    out.push('');
    out.push(table(['Exam', 'Finding', 'First seen'], variantRows(variants.exam)));
    out.push('');
    out.push('### Test results (every different result the case can produce)');
    out.push('');
    out.push(table(['Test', 'Result', 'First seen'], variantRows(variants.tests)));
    out.push('');
    out.push('### Exams and tests rated helpful');
    out.push('');
    out.push(table(['Action', 'Why', 'Source'], Object.entries(def.useful).map(([id, u]) => [CATALOG[id].label, u.why, u.source])));
    out.push('');
    out.push('### Key actions (scored)');
    out.push('');
    out.push(table(['Key action', 'Satisfied by', 'Weight', 'Deadline (min)', 'Why', 'Source'], def.key.map((k) => [
      k.label, k.ids.map((id) => CATALOG[id].label).join(' or '), k.weight, k.deadline ?? 'none', k.why, k.source,
    ])));
    out.push('');
    out.push(`### History answers (spoken by the ${def.history.speaker.toLowerCase()})`);
    out.push('');
    out.push(table(['Topic', 'Answer', 'First seen'], [...variants.hist.entries()].flatMap(([id, byKey]) => [...byKey.values()].map((v) => [id, v.text, v.when]))));
    out.push('');
    out.push('### What you hear at each listening site');
    out.push('');
    out.push('The learner presses a site with the stethoscope. A site with no finding of its own falls back to the general heart or lung finding listed under examination findings.');
    out.push('');
    out.push(table(['Site', 'Finding', 'First seen'], [...variants.ausc.entries()].flatMap(([site, byKey]) => [...byKey.values()].map((v) => [site, v.text, v.when]))));
    out.push('');
    out.push('### What the patient says (every line)');
    out.push('');
    out.push(table(['Line', 'First seen'], [...variants.speech.values()].map((v) => [v.text, v.when])));
    out.push('');
    out.push('### Echocardiogram (every state the case can show)');
    out.push('');
    out.push('Size values are multiples of normal (1 is normal). Ejection fraction is the fraction of blood ejected per beat. Effusion runs from 0 (none) to 1 (large).');
    out.push('');
    out.push(table(['Ejection fraction', 'LV size', 'LA size', 'Wall thickness', 'Effusion', 'RV collapse', 'Mitral regurgitation', 'Weak wall', 'Caption', 'First seen'],
      [...variants.echo.values()].map(({ e, when }) => [e.ef, e.lv, e.la, e.wall, e.effusion, e.rvCollapse, e.mr, e.hypokinesis ?? 'none', e.caption, when])));
    out.push('');
    out.push('### What the patient looks like (every feature the case can show)');
    out.push('');
    out.push('Skin also turns paler as the patient worsens, and breathing speed follows the breathing rate.');
    out.push('');
    out.push(table(['Feature', 'First seen'], [...variants.looks.entries()]));
    out.push('');
    out.push('### 12-lead ECG patterns this case shows');
    out.push('');
    out.push(table(['Pattern', 'First seen'], [...variants.patterns.entries()]));
    out.push('');
    out.push('### Sounds');
    out.push('');
    out.push('These are synthesized approximations. Every combination the case can play:');
    out.push('');
    out.push(table(['Sounds', 'First seen'], [...variants.sounds.entries()]));
    out.push('');
    out.push('### Review decision');
    out.push('');
    out.push('- [ ] Reviewed and accepted');
    out.push('- [ ] Changes needed (list below)');
  }
  out.push('');
  return out.join('\n');
}
