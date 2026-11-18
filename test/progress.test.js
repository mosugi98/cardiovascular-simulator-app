import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, validateProgress, hasProgress, emptyProgress } from '../src/storage/progress.js';

const IDS = ['stemi-anterior', 'afib-rvr', 'adhf', 'cardiac-tamponade'];

function memoryStorage(initial = {}) {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => { m.set(k, String(v)); }, _m: m };
}

test('starts empty with no saved progress', () => {
  const store = createProgressStore({ storage: memoryStorage(), knownCaseIds: IDS });
  assert.deepEqual(store.data.cases, {});
  assert.deepEqual(store.data.favorites, []);
  assert.equal(hasProgress(store.data), false);
});

test('records results and keeps the best score', () => {
  const store = createProgressStore({ storage: memoryStorage(), knownCaseIds: IDS });
  store.recordResult('adhf', 'stabilized', 80, new Date('2026-11-18T10:00:00Z'));
  store.recordResult('adhf', 'dead', 30, new Date('2026-11-19T10:00:00Z'));
  const rec = store.data.cases.adhf;
  assert.equal(rec.attempts, 2);
  assert.equal(rec.bestScore, 80);
  assert.equal(rec.lastOutcome, 'dead');
  assert.equal(rec.lastPlayed, '2026-11-19T10:00:00.000Z');
});

test('progress and favorites persist across store instances', () => {
  const storage = memoryStorage();
  const a = createProgressStore({ storage, knownCaseIds: IDS });
  a.recordResult('afib-rvr', 'stabilized', 90);
  a.toggleFavorite('afib-rvr');
  const b = createProgressStore({ storage, knownCaseIds: IDS });
  assert.equal(b.data.cases['afib-rvr'].bestScore, 90);
  assert.ok(b.isFavorite('afib-rvr'));
  b.toggleFavorite('afib-rvr');
  assert.ok(!b.isFavorite('afib-rvr'));
});

test('export then import on a clean store restores progress', () => {
  const a = createProgressStore({ storage: memoryStorage(), knownCaseIds: IDS });
  a.recordResult('stemi-anterior', 'stabilized', 95);
  a.toggleFavorite('adhf');
  const text = a.exportText();
  const b = createProgressStore({ storage: memoryStorage(), knownCaseIds: IDS });
  assert.deepEqual(b.importText(text), { ok: true });
  assert.deepEqual(b.data, a.data);
});

test('an invalid import is rejected and existing progress is unchanged', () => {
  const store = createProgressStore({ storage: memoryStorage(), knownCaseIds: IDS });
  store.recordResult('adhf', 'stabilized', 70);
  const before = JSON.stringify(store.data);
  const bad = [
    'not json at all',
    '[]',
    JSON.stringify({ version: 99, cases: {}, favorites: [] }),
    JSON.stringify({ version: 1, cases: 'x', favorites: [] }),
    JSON.stringify({ version: 1, cases: { adhf: { attempts: -1, bestScore: 5, lastOutcome: 'dead', lastPlayed: '2026-01-01T00:00:00Z' } }, favorites: [] }),
    JSON.stringify({ version: 1, cases: { adhf: { attempts: 1, bestScore: 500, lastOutcome: 'dead', lastPlayed: '2026-01-01T00:00:00Z' } }, favorites: [] }),
    JSON.stringify({ version: 1, cases: { adhf: { attempts: 1, bestScore: 5, lastOutcome: 'won', lastPlayed: '2026-01-01T00:00:00Z' } }, favorites: [] }),
    JSON.stringify({ version: 1, cases: {}, favorites: [1] }),
  ];
  for (const text of bad) {
    const res = store.importText(text);
    assert.equal(res.ok, false, text);
    assert.ok(res.error.length > 5);
    assert.equal(JSON.stringify(store.data), before);
  }
});

test('unknown case ids in an import are dropped', () => {
  const res = validateProgress({
    version: 1,
    cases: { ghost: { attempts: 1, bestScore: 5, lastOutcome: 'dead', lastPlayed: '2026-01-01T00:00:00Z' } },
    favorites: ['ghost', 'adhf'],
  }, IDS);
  assert.equal(res.ok, true);
  assert.deepEqual(res.data.cases, {});
  assert.deepEqual(res.data.favorites, ['adhf']);
});

test('corrupted saved data is ignored and the store starts empty', () => {
  const storage = memoryStorage({ 'csa.progress.v1': '{{{' });
  const store = createProgressStore({ storage, knownCaseIds: IDS });
  assert.deepEqual(store.data, emptyProgress());
});

test('when storage is unavailable, progress works in memory and persistent is false', () => {
  const store = createProgressStore({ storage: null, knownCaseIds: IDS });
  assert.equal(store.persistent, false);
  store.recordResult('adhf', 'stabilized', 60);
  assert.equal(store.data.cases.adhf.bestScore, 60);
});

test('when storage throws, the app keeps working', () => {
  const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const store = createProgressStore({ storage: throwing, knownCaseIds: IDS });
  assert.equal(store.persistent, false);
  store.toggleFavorite('adhf');
  assert.ok(store.isFavorite('adhf'));
});

test('when saving fails later, persistent turns false but data is kept', () => {
  let fail = false;
  const storage = { getItem: () => null, setItem() { if (fail) throw new Error('quota'); } };
  const store = createProgressStore({ storage, knownCaseIds: IDS });
  assert.equal(store.persistent, true);
  fail = true;
  store.recordResult('adhf', 'stabilized', 60);
  assert.equal(store.persistent, false);
  assert.equal(store.data.cases.adhf.bestScore, 60);
});
