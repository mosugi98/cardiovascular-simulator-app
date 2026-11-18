import test from 'node:test';
import assert from 'node:assert/strict';
import { searchCases, matchesQuery, normalizeQuery, SortMode } from '../src/search/caseSearch.js';
import { sampleCases } from '../src/data/sampleCases.js';

const names = (r) => r.results.map((c) => c.name);

test('normalizeQuery trims and lowercases', () => {
  assert.equal(normalizeQuery('  StEmI '), 'stemi');
  assert.equal(normalizeQuery(null), '');
});

test('empty query returns every case', () => {
  assert.equal(searchCases(sampleCases).results.length, sampleCases.length);
});

test('substring match on name is case-insensitive', () => {
  assert.deepEqual(names(searchCases(sampleCases, { query: 'TACHY' })), ['Ventricular Tachycardia']);
});

test('matches category and chief complaint text', () => {
  assert.ok(names(searchCases(sampleCases, { query: 'arrhythmia' })).includes('Atrial Fibrillation with RVR'));
  assert.ok(names(searchCases(sampleCases, { query: 'syncope' })).includes('Ventricular Tachycardia'));
});

test('exact case number matches, partial number does not', () => {
  assert.deepEqual(names(searchCases(sampleCases, { query: '301' })), ['Acute Decompensated Heart Failure']);
  assert.equal(searchCases(sampleCases, { query: '30' }).results.length, 0);
});

test('prefix-number code matches by startsWith', () => {
  assert.deepEqual(names(searchCases(sampleCases, { query: 'acs-10' })), ['Unstable Angina', 'Anterior STEMI']);
});

test('fields are matched separately, never across their boundary', () => {
  const c = { id: 'x', name: 'Alpha', categories: ['Beta'], chiefComplaints: [] };
  assert.equal(matchesQuery(c, 'a beta'), false);
});

test('filters are OR within a filter and AND between filters', () => {
  const r = searchCases(sampleCases, {
    categories: ['Acute Coronary Syndrome', 'Arrhythmia'],
    chiefComplaints: ['Palpitations'],
  });
  assert.deepEqual(names(r).sort(), ['Atrial Fibrillation with RVR', 'Ventricular Tachycardia']);
});

test('query and filters combine', () => {
  const r = searchCases(sampleCases, { query: 'chest', categories: ['Pericardial Disease'] });
  assert.deepEqual(names(r), ['Cardiac Tamponade']);
});

test('favorites restrict results', () => {
  const r = searchCases(sampleCases, { favoriteIds: ['c3'] });
  assert.deepEqual(names(r), ['Atrial Fibrillation with RVR']);
});

test('default sort: unreleased first, then highest case number', () => {
  const r = names(searchCases(sampleCases));
  assert.equal(r[0], 'Aortic Dissection');
  assert.equal(r[1], 'Cardiac Tamponade');
});

test('recently played sort puts most recent first, never-played last', () => {
  const r = names(searchCases(sampleCases, { sort: SortMode.RecentlyPlayed }));
  assert.equal(r[0], 'Aortic Dissection'); // unreleased still first
  assert.equal(r[1], 'Atrial Fibrillation with RVR');
  assert.equal(r[2], 'Anterior STEMI');
});

test('minQueryLength withholds results until enough input', () => {
  const short = searchCases(sampleCases, { query: 'ac', minQueryLength: 3 });
  assert.deepEqual(short, { results: [], needsMoreInput: true });
  const ok = searchCases(sampleCases, { query: 'acu', minQueryLength: 3 });
  assert.equal(ok.needsMoreInput, false);
  assert.ok(ok.results.length > 0);
});

test('no match returns empty results without needsMoreInput', () => {
  assert.deepEqual(searchCases(sampleCases, { query: 'zzzz' }), { results: [], needsMoreInput: false });
});
