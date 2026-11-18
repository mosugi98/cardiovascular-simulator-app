/**
 * Case search for the Cardiovascular Simulator App.
 *
 * Behaviour is modelled on how a client-side case library search typically
 * works: a case-insensitive substring match over several fields, an exact
 * case-number match, and a "PREFIX-123" code lookup, followed by AND-combined
 * filters and a sort. No search library is needed for a catalogue this size.
 *
 * @typedef {Object} SimCase
 * @property {string} id
 * @property {string} name                 Display name.
 * @property {number} [caseNumber]         Numeric case number.
 * @property {string} [prefix]             Collection abbreviation, e.g. "ACS".
 * @property {string[]} [categories]       e.g. ["Acute Coronary Syndrome"].
 * @property {string[]} [chiefComplaints]  e.g. ["Chest pain"].
 * @property {boolean} [unreleased]
 * @property {string} [lastPlayed]         ISO date string.
 */

export const SortMode = Object.freeze({
  CaseNumber: 'caseNumber', // highest number first
  RecentlyPlayed: 'recentlyPlayed',
  Name: 'name',
});

export const DEFAULT_MIN_QUERY_LENGTH = 3;

/** Trim and lowercase a query. */
export function normalizeQuery(query) {
  return String(query ?? '').trim().toLowerCase();
}

/**
 * Does a single case match a (normalized) query?
 * Each field is matched on its own, so a query can't accidentally match across
 * the boundary between two fields.
 */
export function matchesQuery(simCase, query) {
  const q = normalizeQuery(query);
  if (!q) return true;

  const fields = [simCase.name, ...(simCase.categories ?? []), ...(simCase.chiefComplaints ?? [])];
  if (fields.some((f) => String(f).toLowerCase().includes(q))) return true;

  if (simCase.caseNumber != null && String(simCase.caseNumber) === q) return true;

  if (simCase.prefix && simCase.caseNumber != null) {
    const code = `${simCase.prefix}-${simCase.caseNumber}`.toLowerCase();
    if (code.startsWith(q)) return true;
  }
  return false;
}

/** True when any of `wanted` appears in `have`. An empty `wanted` matches everything. */
function anyOf(wanted, have) {
  if (!wanted || wanted.length === 0) return true;
  if (!have || have.length === 0) return false;
  return wanted.some((w) => have.includes(w));
}

function compare(mode, a, b) {
  // Unreleased cases always come first, as in a content-authoring workflow.
  if (a.unreleased !== b.unreleased) return a.unreleased ? -1 : 1;

  switch (mode) {
    case SortMode.RecentlyPlayed: {
      const ta = a.lastPlayed ? Date.parse(a.lastPlayed) : -Infinity;
      const tb = b.lastPlayed ? Date.parse(b.lastPlayed) : -Infinity;
      if (ta !== tb) return tb - ta;
      return a.name.localeCompare(b.name);
    }
    case SortMode.Name:
      return a.name.localeCompare(b.name);
    case SortMode.CaseNumber:
    default: {
      const na = a.caseNumber ?? -Infinity;
      const nb = b.caseNumber ?? -Infinity;
      if (na !== nb) return nb - na;
      return a.name.localeCompare(b.name);
    }
  }
}

/**
 * Search and filter a list of cases.
 *
 * @param {SimCase[]} cases
 * @param {Object} [options]
 * @param {string} [options.query]
 * @param {string[]} [options.categories]       Match any selected category.
 * @param {string[]} [options.chiefComplaints]  Match any selected complaint.
 * @param {Set<string>|string[]} [options.favoriteIds]  When set, keep only these ids.
 * @param {string} [options.sort]               One of SortMode.
 * @param {number} [options.minQueryLength]     When > 0 the list stays empty until
 *                                              the query is at least this long.
 * @returns {{ results: SimCase[], needsMoreInput: boolean }}
 */
export function searchCases(cases, options = {}) {
  const {
    query = '',
    categories,
    chiefComplaints,
    favoriteIds,
    sort = SortMode.CaseNumber,
    minQueryLength = 0,
  } = options;

  const q = normalizeQuery(query);

  if (minQueryLength > 0 && q.length < minQueryLength) {
    return { results: [], needsMoreInput: true };
  }

  const favorites = favoriteIds ? new Set(favoriteIds) : null;

  const results = cases
    .filter(
      (c) =>
        anyOf(categories, c.categories) &&
        anyOf(chiefComplaints, c.chiefComplaints) &&
        matchesQuery(c, q) &&
        (!favorites || favorites.has(c.id)),
    )
    .sort((a, b) => compare(sort, a, b));

  return { results, needsMoreInput: false };
}
