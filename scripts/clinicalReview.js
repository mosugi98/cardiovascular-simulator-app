import { CASES } from '../src/cases/index.js';
import { CATALOG } from '../src/engine/catalog.js';
import { createSim, MODES } from '../src/engine/sim.js';
import { SCORING } from '../src/engine/score.js';
import { CHALLENGE_SIM_MIN_PER_SEC } from '../src/engine/sim.js';

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

  for (const def of CASES) {
    const start = createSim(def, MODES.LEARNING);
    out.push('');
    out.push(`## ${def.name} (${def.prefix}-${def.caseNumber})`);
    out.push('');
    out.push(`**Categories:** ${def.categories.join(', ')}. **Chief complaints:** ${def.chiefComplaints.join(', ')}.`);
    out.push('');
    out.push(`**Patient:** ${def.patient}`);
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
    out.push('### Examination findings at the start');
    out.push('');
    out.push(table(['Exam', 'Finding'], Object.entries(def.exam).map(([id, fn]) => [CATALOG[id].label, fn(start)])));
    out.push('');
    out.push('### Test results at the start');
    out.push('');
    out.push(table(['Test', 'Result'], Object.entries(def.tests).map(([id, fn]) => [CATALOG[id].label, fn(start)])));
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
    out.push('### Sounds');
    out.push('');
    out.push(`At the start the simulated heart sound is "${def.sounds(start).heart}" and the lung sound is "${def.sounds(start).lungs}". These are synthesized approximations.`);
    out.push('');
    out.push('### Review decision');
    out.push('');
    out.push('- [ ] Reviewed and accepted');
    out.push('- [ ] Changes needed (list below)');
  }
  out.push('');
  return out.join('\n');
}
