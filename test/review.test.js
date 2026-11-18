import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReviewMarkdown } from '../scripts/clinicalReview.js';
import { CASES } from '../src/cases/index.js';
import { CATALOG } from '../src/engine/catalog.js';

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
