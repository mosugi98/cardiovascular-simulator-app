import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReturn, cleanLabel } from '../src/ui/embed.js';
import { CASES } from '../src/cases/index.js';

const OWN = 'https://mosugi98.github.io';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('a return address on the same site is accepted, with its label', () => {
  const r = parseReturn('?return=https%3A%2F%2Fmosugi98.github.io%2Fcv-mastery%2F&returnLabel=CARDIO%20PPDS%20MASTER', OWN);
  assert.deepEqual(r, { href: 'https://mosugi98.github.io/cv-mastery/', label: 'CARDIO PPDS MASTER' });
});

test('a relative return address stays on this site', () => {
  const r = parseReturn('?return=/cv-mastery/', OWN);
  assert.equal(r.href, 'https://mosugi98.github.io/cv-mastery/');
  assert.equal(r.label, 'the previous page');
});

test('a return address on another site is refused', () => {
  for (const bad of [
    'https://evil.example/', 'https://mosugi98.github.io.evil.example/', 'https://evil.example/https://mosugi98.github.io/',
    '//evil.example/x', 'http://mosugi98.github.io/cv-mastery/', 'https://mosugi98.github.io:8443/', 'https://other.github.io/cv-mastery/',
  ]) {
    assert.equal(parseReturn(`?return=${encodeURIComponent(bad)}`, OWN), null, bad);
  }
});

test('addresses that run code or carry credentials are refused', () => {
  for (const bad of ['javascript:alert(1)', 'data:text/html,<script>1</script>', 'vbscript:x', 'file:///c:/x', 'https://user:pw@mosugi98.github.io/']) {
    assert.equal(parseReturn(`?return=${encodeURIComponent(bad)}`, OWN), null, bad);
  }
});

test('a missing, empty or very long return address gives no link', () => {
  assert.equal(parseReturn('', OWN), null);
  assert.equal(parseReturn('?return=', OWN), null);
  assert.equal(parseReturn('?other=1', OWN), null);
  assert.equal(parseReturn(`?return=${'a'.repeat(600)}`, OWN), null);
  assert.equal(parseReturn('?return=https%3A%2F%2F%5B', OWN), null, 'a malformed address');
});

test('local development servers may link to each other, and only to each other', () => {
  const local = 'http://127.0.0.1:8099';
  assert.ok(parseReturn('?return=http%3A%2F%2Flocalhost%3A3000%2F', local));
  assert.ok(parseReturn('?return=http%3A%2F%2F127.0.0.1%3A8100%2Fhost.html', local));
  assert.equal(parseReturn('?return=http%3A%2F%2Flocalhost%3A3000%2F', OWN), null, 'a public simulator never links to localhost');
  assert.equal(parseReturn('?return=https%3A%2F%2Fevil.example%2F', local), null);
});

test('the label is plain text: markup and control characters are removed, and it is cut short', () => {
  assert.equal(cleanLabel('<img src=x onerror=alert(1)>Home'), 'img src=x onerror=alert(1)Home');
  assert.ok(!/[<>]/.test(cleanLabel('<script>alert(1)</script>')));
  assert.equal(cleanLabel('  a\n\tb  '), 'a b');
  assert.equal(cleanLabel('x'.repeat(200)).length, 40);
  assert.equal(cleanLabel(''), 'the previous page');
  assert.equal(cleanLabel(null), 'the previous page');
  assert.equal(cleanLabel('\u0000\u0007'), 'the previous page');
});

test('the integration guide lists a deep link for every case, and the documented parameters', () => {
  const doc = fs.readFileSync(path.join(root, 'docs', 'integration.md'), 'utf8');
  for (const def of CASES) {
    assert.ok(doc.includes(`#/case/${def.id}`), `${def.id}: mode-choice link`);
    assert.ok(doc.includes(`#/play/${def.id}/learning`) && doc.includes(`#/play/${def.id}/challenge`), `${def.id}: play links`);
  }
  assert.ok(doc.includes('return') && doc.includes('returnLabel'));
  assert.match(doc, /iframe/);
  assert.match(doc, /csa\.progress\.v1/);
});
