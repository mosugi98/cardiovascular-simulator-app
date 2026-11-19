/**
 * Scoring rules (also listed in docs/clinical-content-review.md).
 *
 *   key actions   up to 70 points, split by each key action's weight.
 *                 On time = full weight, late = half, missed = 0.
 *   outcome       30 points if the patient stabilized, otherwise 0.
 *   harm          -8 points for each harmful action, at most -40 in total.
 *   score         key + outcome - harm, rounded and kept between 0 and 100.
 */
export const SCORING = Object.freeze({
  keyActionPoints: 70,
  outcomePoints: 30,
  harmPenaltyEach: 8,
  harmPenaltyMax: 40,
  lateFactor: 0.5,
});

const OUTCOME_TEXT = {
  stabilized: 'The patient stabilized.',
  dead: 'The patient died.',
  finished: 'You ended the case before the patient stabilized.',
  active: 'The case is still in progress.',
};

export function debrief(def, state) {
  const done = state.log.filter((e) => e.kind !== 'event');

  const totalWeight = def.key.reduce((sum, k) => sum + k.weight, 0);
  let earned = 0;
  const keyResults = def.key.map((k) => {
    const hit = done.find((e) => k.ids.includes(e.id));
    let status = 'missed';
    let credit = 0;
    if (hit) {
      const late = k.deadline != null && hit.t > k.deadline;
      status = late ? 'late' : 'on-time';
      credit = k.weight * (late ? SCORING.lateFactor : 1);
    }
    earned += credit;
    return { label: k.label, ids: k.ids, weight: k.weight, deadline: k.deadline ?? null, why: k.why, source: k.source ?? '', status, at: hit?.t ?? null };
  });

  const keyScore = totalWeight ? (earned / totalWeight) * SCORING.keyActionPoints : 0;
  const outcomeScore = state.status === 'stabilized' ? SCORING.outcomePoints : 0;
  const harmCount = done.filter((e) => e.rating === 'harmful').length;
  const harmPenalty = Math.min(SCORING.harmPenaltyMax, harmCount * SCORING.harmPenaltyEach);
  const score = Math.round(Math.max(0, Math.min(100, keyScore + outcomeScore - harmPenalty)));

  return {
    status: state.status,
    outcome: OUTCOME_TEXT[state.status],
    reason: state.endReason,
    score,
    breakdown: { keyScore: Math.round(keyScore), outcomeScore, harmPenalty, harmCount },
    timeline: done.map((e) => ({
      t: e.t, id: e.id, label: e.label, kind: e.kind, text: e.text,
      rating: e.rating, why: e.why, source: e.source,
    })),
    missed: keyResults.filter((k) => k.status === 'missed'),
    keyResults,
  };
}
