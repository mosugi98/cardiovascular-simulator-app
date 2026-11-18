// Bedside monitor alarm rules. Pure functions, so they can be tested without a browser.

export const ALARM_LIMITS = Object.freeze({
  hrHigh: 120,
  hrLow: 50,
  sbpLow: 90,
  spo2Low: 90,
  rrHigh: 28,
  urgent: Object.freeze({ spo2Below: 85, sbpBelow: 80, hrAbove: 150, hrBelow: 40 }),
});

/** Alarms that are active for these vitals. `level` is 'high' (urgent) or 'medium'. */
export function activeAlarms(v) {
  const L = ALARM_LIMITS;
  const out = [];
  const hr = Math.round(v.hr);
  const sbp = Math.round(v.sbp);
  const dbp = Math.round(v.dbp);
  const spo2 = Math.round(v.spo2);
  const rr = Math.round(v.rr);
  if (hr > L.hrHigh) out.push({ id: 'hr-high', text: `Heart rate high, ${hr}`, level: hr > L.urgent.hrAbove ? 'high' : 'medium', nurse: `Heart rate is ${hr}.` });
  if (hr < L.hrLow) out.push({ id: 'hr-low', text: `Heart rate low, ${hr}`, level: hr < L.urgent.hrBelow ? 'high' : 'medium', nurse: `Heart rate has dropped to ${hr}.` });
  if (sbp < L.sbpLow) out.push({ id: 'bp-low', text: `Blood pressure low, ${sbp}/${dbp}`, level: sbp < L.urgent.sbpBelow ? 'high' : 'medium', nurse: `Pressure is ${sbp} over ${dbp}.` });
  if (spo2 < L.spo2Low) out.push({ id: 'spo2-low', text: `Oxygen low, ${spo2}%`, level: spo2 < L.urgent.spo2Below ? 'high' : 'medium', nurse: `Sats are down to ${spo2}%.` });
  if (rr > L.rrHigh) out.push({ id: 'rr-high', text: `Breathing rate high, ${rr}`, level: 'medium', nurse: `Breathing at ${rr}.` });
  return out;
}

/** The most urgent level among the alarms, or null. */
export function topLevel(alarms) {
  if (alarms.some((a) => a.level === 'high')) return 'high';
  return alarms.length ? 'medium' : null;
}

/** Nurse call-outs for alarms that have just started (not in `previousIds`). */
export function newCallouts(previousIds, alarms) {
  return alarms.filter((a) => !previousIds.has(a.id)).map((a) => `Nurse: ${a.nurse}`);
}
