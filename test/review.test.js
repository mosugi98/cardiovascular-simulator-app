import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReviewMarkdown, collectVariants } from '../scripts/clinicalReview.js';
import { CASES } from '../src/cases/index.js';
import { CATALOG } from '../src/engine/catalog.js';
import { createSim, perform, advance, MODES } from '../src/engine/sim.js';

const norm = (t) => String(t).replace(/\d+(\.\d+)?/g, '#');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'docs', 'clinical-content-review.md');

test('the clinical content review file exists and is up to date (run npm run review:gen)', () => {
  assert.ok(fs.existsSync(file), 'docs/clinical-content-review.md is missing');
  const onDisk = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(onDisk, buildReviewMarkdown().replace(/\r\n/g, '\n'));
});

test('the review file lists every case, treatment, key action and parameter', () => {
  const md = buildReviewMarkdown();
  assert.match(md, /NOT clinically reviewed/);
  for (const def of CASES) {
    assert.ok(md.includes(`## ${def.name}`), def.name);
    for (const id of Object.keys(def.treat)) assert.ok(md.includes(CATALOG[id].label), `${def.id} treatment ${id}`);
    for (const k of def.key) assert.ok(md.includes(k.label), `${def.id} key ${k.label}`);
    for (const k of Object.keys(def.params)) assert.ok(md.includes(`| ${k}`), `${def.id} param ${k}`);
    for (const r of def.rules) assert.ok(md.includes(r), `${def.id} rule`);
  }
});

test('the review file lists the findings a case shows after the patient changes, not just at the start', () => {
  const md = buildReviewMarkdown();
  const probes = [
    'Effusion reduced to a small rim',
    'Diffuse mild ST elevation with PR depression',
    'reperfusion pattern',
    'Grey, drenched in sweat',
    'No acute ST changes',
    'Pulmonary edema is clearing',
    'Regular, normal heart sounds',
    'heart: muffled, lungs: clear',
    'heart: normal, lungs: clear',
  ];
  for (const p of probes) assert.ok(md.toLowerCase().includes(p.toLowerCase()), `missing: ${p}`);
});

test('every exam finding, test result and sound that random play can produce is in the review file', () => {
  let seed = 12345;
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const ids = Object.keys(CATALOG).filter((id) => id !== 'wait');
  const missing = [];
  for (const def of CASES) {
    const v = collectVariants(def);
    for (let run = 0; run < 80; run++) {
      const s = createSim(def, MODES.CHALLENGE);
      const steps = 1 + Math.floor(rand() * 8);
      for (let i = 0; i < steps && s.status === 'active'; i++) {
        perform(def, s, ids[Math.floor(rand() * ids.length)]);
        advance(def, s, Math.floor(rand() * 25));
        for (const [id, fn] of Object.entries(def.exam)) if (!v.exam.get(id)?.has(norm(fn(s)))) missing.push(`${def.id} exam ${id}: ${fn(s)}`);
        for (const [id, fn] of Object.entries(def.tests)) if (!v.tests.get(id)?.has(norm(fn(s)))) missing.push(`${def.id} test ${id}: ${fn(s)}`);
        const snd = def.sounds(s);
        if (!v.sounds.has(`heart: ${snd.heart}, lungs: ${snd.lungs}`)) missing.push(`${def.id} sounds ${snd.heart}/${snd.lungs}`);
      }
    }
  }
  assert.deepEqual([...new Set(missing)].slice(0, 10), []);
});

test('every treatment and key action has a guideline source (or is explicitly sourceless by design)', () => {
  for (const def of CASES) {
    for (const [id, t] of Object.entries(def.treat)) {
      if (t.rating === 'harmful' || t.rating === 'helpful') assert.ok(t.source, `${def.id}.${id} needs a source`);
    }
    for (const k of def.key) assert.ok(k.source, `${def.id} key ${k.label} needs a source`);
  }
});

test('every case shows the "not clinically reviewed" notice text in the app code', () => {
  const app = fs.readFileSync(path.join(root, 'src', 'ui', 'app.js'), 'utf8');
  assert.match(app, /has not been clinically reviewed/);
  const uses = (app.match(/notReviewed\(\)/g) ?? []).length;
  assert.ok(uses >= 4, 'notice is used on list, intro, play and debrief');
});

test('no content from the Full Code Medical Simulation app is referenced', () => {
  const dirs = ['src', 'scripts', 'docs'];
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } };
  for (const d of dirs) walk(path.join(root, d));
  files.push(path.join(root, 'index.html'), path.join(root, 'styles.css'));
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    assert.ok(!/fullcode|full\s*code\s*medical|minerva/i.test(t), `${path.relative(root, f)} mentions the other product`);
  }
});
