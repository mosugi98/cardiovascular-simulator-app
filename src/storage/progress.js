const KEY = 'csa.progress.v1';
export const PROGRESS_VERSION = 1;

export const emptyProgress = () => ({ version: PROGRESS_VERSION, cases: {}, favorites: [] });

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Check imported data. Returns { ok: true, data } with a cleaned copy, or
 * { ok: false, error }. Unknown fields are dropped.
 */
export function validateProgress(raw, knownCaseIds) {
  if (!isObj(raw)) return { ok: false, error: 'The file is not a progress file.' };
  if (raw.version !== PROGRESS_VERSION) return { ok: false, error: 'This progress file has an unsupported version.' };
  if (!isObj(raw.cases)) return { ok: false, error: 'The file has no case results.' };
  if (!Array.isArray(raw.favorites)) return { ok: false, error: 'The file has no favorites list.' };

  const cases = {};
  for (const [id, rec] of Object.entries(raw.cases)) {
    if (!knownCaseIds.includes(id)) continue;
    if (!isObj(rec)) return { ok: false, error: `The result for ${id} is not valid.` };
    const { attempts, bestScore, lastOutcome, lastPlayed } = rec;
    if (!Number.isInteger(attempts) || attempts < 0) return { ok: false, error: `The attempt count for ${id} is not valid.` };
    if (!Number.isFinite(bestScore) || bestScore < 0 || bestScore > 100) return { ok: false, error: `The best score for ${id} is not valid.` };
    if (!['stabilized', 'dead', 'finished'].includes(lastOutcome)) return { ok: false, error: `The outcome for ${id} is not valid.` };
    if (typeof lastPlayed !== 'string' || Number.isNaN(Date.parse(lastPlayed))) return { ok: false, error: `The date for ${id} is not valid.` };
    cases[id] = { attempts, bestScore: Math.round(bestScore), lastOutcome, lastPlayed };
  }
  if (!raw.favorites.every((f) => typeof f === 'string')) return { ok: false, error: 'The favorites list is not valid.' };
  const favorites = [...new Set(raw.favorites.filter((f) => knownCaseIds.includes(f)))];
  return { ok: true, data: { version: PROGRESS_VERSION, cases, favorites } };
}

export function hasProgress(p) {
  return Object.keys(p.cases).length > 0 || p.favorites.length > 0;
}

/**
 * Progress kept in the browser. `storage` is injectable for tests and may be
 * null or throw, in which case progress lives in memory only.
 */
export function createProgressStore({ storage = defaultStorage(), knownCaseIds }) {
  let data = emptyProgress();
  let persistent = false;

  try {
    if (storage) {
      persistent = true;
      const text = storage.getItem(KEY);
      if (text) {
        const res = validateProgress(JSON.parse(text), knownCaseIds);
        if (res.ok) data = res.data;
      }
    }
  } catch {
    persistent = false;
  }

  function save() {
    if (!persistent) return;
    try { storage.setItem(KEY, JSON.stringify(data)); } catch { persistent = false; }
  }

  return {
    get data() { return data; },
    /** False when the browser blocks storage, so progress won't be remembered. */
    get persistent() { return persistent; },

    recordResult(caseId, status, score, now = new Date()) {
      const prev = data.cases[caseId];
      data.cases[caseId] = {
        attempts: (prev?.attempts ?? 0) + 1,
        bestScore: Math.max(prev?.bestScore ?? 0, score),
        lastOutcome: status,
        lastPlayed: now.toISOString(),
      };
      save();
    },

    isFavorite: (id) => data.favorites.includes(id),
    toggleFavorite(id) {
      data.favorites = data.favorites.includes(id) ? data.favorites.filter((f) => f !== id) : [...data.favorites, id];
      save();
    },

    exportText: () => JSON.stringify(data, null, 2),

    /** Replace saved progress with the contents of an exported file. */
    importText(text) {
      let raw;
      try { raw = JSON.parse(text); } catch { return { ok: false, error: 'The file is not valid JSON.' }; }
      const res = validateProgress(raw, knownCaseIds);
      if (!res.ok) return res;
      data = res.data;
      save();
      return { ok: true };
    },
  };
}

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}
