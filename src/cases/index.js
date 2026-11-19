import stemi from './stemi.js';
import afib from './afib.js';
import heartFailure from './heartFailure.js';
import tamponade from './tamponade.js';
import shock from './shock.js';
import arrest from './arrest.js';
import svt from './svt.js';
import vt from './vt.js';
import htn from './htn.js';

/** All playable cases. Each one also works as a record for the case search. */
export const CASES = [stemi, afib, heartFailure, tamponade, svt, vt, shock, arrest, htn];

export function getCase(id) {
  return CASES.find((c) => c.id === id) ?? null;
}
