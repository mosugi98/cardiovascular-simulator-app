import { CATALOG } from './catalog.js';
import { clamp } from './util.js';

export const MODES = Object.freeze({ LEARNING: 'learning', CHALLENGE: 'challenge' });

/** Simulated minutes per real second in challenge mode (5 real seconds = 1 minute). */
export const CHALLENGE_SIM_MIN_PER_SEC = 0.2;

const STEP_MIN = 1;
const VITAL_LAG_PER_MIN = 0.3;
const VITAL_LIMITS = {
  hr: [0, 220], sbp: [0, 260], dbp: [0, 160], spo2: [0, 100], rr: [0, 60], temp: [30, 42],
};

const DEFAULT_TREAT = {
  rating: 'neutral',
  why: 'This treatment is not indicated here and has no major effect on this patient.',
  source: '',
};

/** Create a fresh case run. */
export function createSim(def, mode) {
  const init = def.setup();
  const state = {
    caseId: def.id,
    mode,
    t: 0,
    severity: init.severity,
    flags: { ...init.flags },
    vitals: {},
    rhythm: 'sinus',
    ecg: {},
    status: 'active', // active | stabilized | dead | finished
    endReason: null,
    endedAt: null,
    log: [],
  };
  const tg = def.targets(state);
  state.vitals = { ...tg.vitals };
  state.rhythm = tg.rhythm;
  state.ecg = { ...tg.ecg };
  return state;
}

/** Move the case forward by `minutes`, in steps of at most one minute. */
export function advance(def, state, minutes) {
  let left = minutes;
  while (left > 1e-9 && state.status === 'active') {
    const dt = Math.min(STEP_MIN, left);
    left -= dt;
    state.t += dt;
    state.severity = clamp(state.severity + def.rates(state) * dt, 0, 1);
    for (const text of def.events?.(state) ?? []) state.log.push({ t: state.t, kind: 'event', text });

    const tg = def.targets(state);
    const k = 1 - Math.exp(-VITAL_LAG_PER_MIN * dt);
    for (const key of Object.keys(tg.vitals)) {
      const [lo, hi] = VITAL_LIMITS[key];
      const target = clamp(tg.vitals[key], lo, hi);
      state.vitals[key] += (target - state.vitals[key]) * k;
    }
    state.rhythm = tg.rhythm;
    state.ecg = { ...tg.ecg };

    const end = def.end(state);
    if (end) endCase(def, state, end.status, end.reason);
  }
}

function endCase(def, state, status, reason) {
  state.status = status;
  state.endReason = reason;
  state.endedAt = state.t;
  if (status === 'dead') {
    state.rhythm = def.deathRhythm ?? 'asystole';
    state.ecg = { ...state.ecg };
  }
  state.log.push({ t: state.t, kind: 'event', text: reason });
}

/** The learner ends the case voluntarily. */
export function finish(def, state) {
  if (state.status !== 'active') return;
  endCase(def, state, 'finished', 'You ended the case.');
}

/** Show a new rhythm and ECG at once, instead of waiting for the next clock tick. */
function syncDisplay(def, state) {
  if (state.status !== 'active') return;
  const tg = def.targets(state);
  state.rhythm = tg.rhythm;
  state.ecg = { ...tg.ecg };
}

function resolveRating(def, state, id) {
  const spec = def.treat[id];
  if (!spec) return { ...DEFAULT_TREAT };
  const r = spec.rate ? spec.rate(state) : spec;
  return { rating: r.rating, why: r.why, source: r.source ?? '' };
}

/**
 * Carry out an action. Returns { ok, entry } or { ok: false, error }.
 * In learning mode the action's time cost passes after it is carried out.
 */
export function perform(def, state, id, opts = {}) {
  if (state.status !== 'active') return { ok: false, error: 'The case has ended.' };
  const action = CATALOG[id];
  if (!action) return { ok: false, error: `Unknown action: ${id}` };
  if (state.mode === MODES.CHALLENGE && action.kind === 'wait') {
    return { ok: false, error: 'Waiting is not available in challenge mode: the clock is already running.' };
  }

  const repeat = state.log.some((e) => e.id === id && e.kind === action.kind);
  const entry = { t: state.t, id, kind: action.kind, label: opts.label ?? action.label };

  if (action.kind === 'history') {
    Object.assign(entry, { rating: 'neutral', why: 'Taking a history is part of every assessment. It is not scored.', source: '', text: opts.text ?? '' });
    state.log.push(entry);
    if (state.mode === MODES.LEARNING) advance(def, state, action.cost);
    return { ok: true, entry };
  }

  if (action.kind === 'treat') {
    let r = resolveRating(def, state, id);
    if (repeat && r.rating === 'helpful' && !def.treat[id]?.repeatable) {
      r = { rating: 'neutral', why: 'A repeat dose adds no further benefit here.', source: r.source };
    }
    Object.assign(entry, r);
    state.log.push(entry);
    def.treat[id]?.apply?.(state);
    entry.text = def.treat[id]?.text ?? 'Done.';
  } else if (action.kind === 'exam') {
    const useful = def.useful?.[id];
    Object.assign(entry, useful && !repeat
      ? { rating: 'helpful', why: useful.why, source: useful.source ?? '' }
      : { rating: 'neutral', why: repeat ? 'Repeating this adds little.' : 'Reasonable, but it does not change management here.', source: '' });
    // Listening at a particular site gives that site's finding, when the case has one.
    const sound = id === 'heartSounds' ? 'heart' : id === 'lungs' ? 'lungs' : null;
    const atSite = sound && opts.area ? def.auscultation?.[sound]?.[opts.area] : null;
    entry.text = atSite ? atSite(state) : def.exam[id](state);
    state.log.push(entry);
  } else if (action.kind === 'test') {
    const useful = def.useful?.[id];
    Object.assign(entry, useful && !repeat
      ? { rating: 'helpful', why: useful.why, source: useful.source ?? '' }
      : { rating: 'neutral', why: repeat ? 'Repeating this adds little.' : 'Reasonable, but it does not change management here.', source: '' });
    state.log.push(entry);
    if (state.mode === MODES.LEARNING) advance(def, state, action.cost);
    entry.text = state.status === 'active' || state.status === 'stabilized' || state.status === 'finished'
      ? def.tests[id](state)
      : 'The patient deteriorated before this result came back.';
    syncDisplay(def, state);
    return { ok: true, entry };
  } else {
    // wait
    Object.assign(entry, { rating: 'neutral', why: 'Watching and waiting does not treat the patient.', source: '' });
    entry.text = 'You observe the patient.';
    state.log.push(entry);
  }

  if (state.mode === MODES.LEARNING) advance(def, state, action.cost);
  syncDisplay(def, state);
  return { ok: true, entry };
}

/** Actions to show in the menu for a mode. */
export function menuFor(mode) {
  return Object.entries(CATALOG)
    .filter(([, a]) => a.kind !== 'history')
    .filter(([, a]) => !(mode === MODES.CHALLENGE && a.kind === 'wait'))
    .map(([id, a]) => ({ id, ...a }));
}
