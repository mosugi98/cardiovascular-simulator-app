import { CATALOG } from '../engine/catalog.js';

/** Treatments that are clearly unsafe when they are not indicated. Cases that use them list them themselves. */
export const UNSAFE_UNLESS_INDICATED = Object.freeze(['epinephrine', 'defib', 'adenosine', 'labetalol', 'nicardipine', 'cpr']);

const WHY = {
  epinephrine: 'Epinephrine speeds the heart and raises blood pressure. It is only for cardiac arrest and a few emergencies, and is dangerous here.',
  defib: 'An unsynchronized shock is for pulseless ventricular fibrillation or tachycardia. With a pulse it can trigger a dangerous rhythm.',
  adenosine: 'Adenosine stops the heart for a few seconds and is only for certain fast, regular rhythms. It is not indicated here.',
  labetalol: 'Labetalol lowers blood pressure and heart rate. It is not indicated here and could drop blood pressure dangerously.',
  nicardipine: 'Nicardipine lowers blood pressure. It is not indicated here and could drop blood pressure dangerously.',
  cpr: 'Chest compressions on a patient who has a pulse can injure them and are not indicated.',
};

/**
 * Treatment entries rated harmful for treatments that are unsafe without an indication.
 * `source` is the guideline the case rests on. Entries the case lists itself override these.
 */
export function unindicated(source, ids = UNSAFE_UNLESS_INDICATED, harm = 0.04) {
  const out = {};
  for (const id of ids) {
    out[id] = {
      rating: 'harmful',
      why: WHY[id],
      source,
      apply: (s) => { s.severity = Math.min(1, s.severity + harm); },
      text: `${CATALOG[id].label}. This was not indicated and the patient is worse for it.`,
    };
  }
  return out;
}
