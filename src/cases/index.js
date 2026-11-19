import stemi from './stemi.js';
import afib from './afib.js';
import heartFailure from './heartFailure.js';
import tamponade from './tamponade.js';
import shock from './shock.js';
import arrest from './arrest.js';
import svt from './svt.js';
import vt from './vt.js';
import htn from './htn.js';

/**
 * The echo result is the live echo caption, so the written result and the picture on the ultrasound
 * screen can never disagree. Every case supplies its caption from the patient's current state.
 */
const withEchoResult = (def) => ({ ...def, tests: { ...def.tests, echo: (s) => def.echo(s).caption } });

/** All playable cases. Each one also works as a record for the case search. */
export const CASES = [stemi, afib, heartFailure, tamponade, svt, vt, shock, arrest, htn].map(withEchoResult);

export function getCase(id) {
  return CASES.find((c) => c.id === id) ?? null;
}
