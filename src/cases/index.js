import stemi from './stemi.js';
import afib from './afib.js';
import heartFailure from './heartFailure.js';
import tamponade from './tamponade.js';

/** All playable cases. Each one also works as a record for the case search. */
export const CASES = [stemi, afib, heartFailure, tamponade];

export function getCase(id) {
  return CASES.find((c) => c.id === id) ?? null;
}
