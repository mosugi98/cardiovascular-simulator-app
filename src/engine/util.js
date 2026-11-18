export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Linear model: [a, b] means a + b * severity. */
export const lin = ([a, b], severity) => a + b * severity;

export const round = Math.round;

/** Append a narrative event to a case log. */
export function addEvent(state, text) {
  state.log.push({ t: state.t, kind: 'event', text });
}
