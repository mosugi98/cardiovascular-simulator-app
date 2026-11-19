// History taking. A typed question is matched to a topic by its words, and the case supplies the answer.
// Pure functions, so they can be tested without a browser.

export const MAX_QUESTION_LENGTH = 200;

/**
 * Topics in the order they are tried, so a more specific topic wins over a general one.
 * `ask` is the suggested question shown on a button.
 */
export const INTENTS = Object.freeze([
  { id: 'collapse', ask: 'Did anyone see what happened?', words: /\b(witness(ed)?|bystander|down ?time|how long (was|has) (he|she|the patient)|did anyone see|found (him|her)|aed|cpr|shock(ed)? (him|her))\b/i },
  { id: 'adherence', ask: 'Have you missed any medicines?', words: /\b(missed|run out|ran out|stopped taking|stop taking|compliance|adherence|forgot|forget)\b/i },
  { id: 'allergies', ask: 'Do you have any allergies?', words: /\b(allerg\w*|reaction to)\b/i },
  { id: 'meds', ask: 'What medicines do you take?', words: /\b(medications?|medicines?|tablets?|pills?|prescri\w+|what (do you|are you) (take|taking)|taking any)\b/i },
  { id: 'family', ask: 'Does heart disease run in your family?', words: /\b(family|father|mother|parents?|brother|sister|runs in)\b/i },
  { id: 'pmh', ask: 'Do you have any medical conditions?', words: /\b(medical (history|conditions?|problems?)|past (history|medical)|history of|heart (problems?|attack|disease|failure|condition)|diabet\w*|blood pressure|hypertension|cholesterol|surgery|operation|stent|conditions?|illnesses|previous (illness|problems?))\b/i },
  { id: 'lastmeal', ask: 'When did you last eat or drink?', words: /\b(eat|ate|eaten|meal|food|last (drink|ate|meal))\b/i },
  { id: 'social', ask: 'Do you smoke, drink or use drugs?', words: /\b(smok\w*|cigarettes?|tobacco|alcohol|do you drink|drugs?|cocaine|recreational|caffeine|coffee|energy drinks?)\b/i },
  { id: 'syncope', ask: 'Have you fainted or felt dizzy?', words: /\b(faint\w*|pass(ed)? out|black(ed)? out|dizz\w*|light.?headed|syncope|collapse[d]?)\b/i },
  { id: 'headache', ask: 'Do you have a headache?', words: /\b(head ?ache|head pain|migraine)\b/i },
  { id: 'vision', ask: 'Is your vision affected?', words: /\b(vision|blurr\w*|see (double|spots|clearly)|eyes?|sight)\b/i },
  { id: 'neuro', ask: 'Any weakness, numbness or trouble speaking?', words: /\b(weak\w*|numb\w*|speech|slur\w*|confus\w*|speak\w*|trouble talking)\b/i },
  { id: 'palpitations', ask: 'Can you feel your heart racing?', words: /\b(palpitat\w*|racing|fluttering|pounding|heart ?beat|skipp\w*|irregular)\b/i },
  { id: 'sweating', ask: 'Are you sweaty or clammy?', words: /\b(sweat\w*|clammy|diaphore\w*)\b/i },
  { id: 'nausea', ask: 'Do you feel sick or have you vomited?', words: /\b(nause\w*|vomit\w*|sick to|throwing up|queasy)\b/i },
  { id: 'breathless', ask: 'Are you short of breath?', words: /\b(breath\w*|short of|dyspn\w*|orthopn\w*|pillows|lie flat|lying flat|cough\w*)\b/i },
  { id: 'swelling', ask: 'Are your legs or ankles swollen?', words: /\b(swell\w*|swollen|oedema|edema|ankles?|legs?)\b/i },
  { id: 'infection', ask: 'Have you been unwell recently?', words: /\b(fever|cold|flu|infection|virus|viral|unwell|ill lately|recently ill)\b/i },
  { id: 'prior', ask: 'Has this happened before?', words: /\b(before|previous(ly)?|again|ever had|happened|episodes?|similar|first time)\b/i },
  { id: 'severity', ask: 'How bad is it, out of 10?', words: /\b(how bad|how severe|severity|how much|rate (it|the)|scale|out of 10|0 to 10|0-10)\b/i },
  { id: 'radiation', ask: 'Does it spread anywhere?', words: /\b(spread\w*|radiat\w*|move to|go(es)? to|jaw|arm|shoulder|neck|back)\b/i },
  { id: 'provoking', ask: 'What makes it better or worse?', words: /\b(worse|better|trigger\w*|brings? (it )?on|exertion|exercise|walking|rest|lying|leaning|position|relieve\w*|ease\w*|help\w*)\b/i },
  { id: 'quality', ask: 'What does it feel like?', words: /\b(feel like|describe|what kind|sharp|dull|crushing|tight\w*|pressure|burning|type of pain|squeez\w*|stabbing)\b/i },
  { id: 'location', ask: 'Where is the pain?', words: /\b(where|which (part|side)|location|point to)\b/i },
  { id: 'onset', ask: 'When did it start?', words: /\b(when|start(ed)?|began|begin|onset|how long|since when|sudden\w*|ago)\b/i },
  { id: 'complaint', ask: 'What is wrong?', words: /\b(what('s| is) (wrong|the (problem|matter))|what happened|brought you|why are you here|how are you|tell me (what|about)|main (problem|complaint)|what can i do|problem)\b/i },
]);

/** Plain answers for topics a case does not answer itself. */
export const DEFAULT_ANSWER = Object.freeze({
  symptom: 'No, not that I have noticed.',
  history: 'Nothing that I know of.',
  unknown: 'Sorry, I am not sure what you are asking. Could you ask it another way?',
});
const SYMPTOMS = new Set(['syncope', 'headache', 'vision', 'neuro', 'palpitations', 'sweating', 'nausea', 'breathless', 'swelling', 'infection', 'prior', 'radiation', 'provoking']);

/** Which topic a question is about, or null when it is empty or not understood. */
export function matchIntent(text) {
  const q = String(text ?? '').trim().slice(0, MAX_QUESTION_LENGTH);
  if (!q) return null;
  return INTENTS.find((i) => i.words.test(q))?.id ?? null;
}

/** The suggested question for a topic. */
export function suggestedQuestion(id) {
  return INTENTS.find((i) => i.id === id)?.ask ?? '';
}

/** Who answers, and what they say, for one topic in the current state of the case. */
export function answerFor(def, state, intentId) {
  const h = def.history;
  const raw = h.answers[intentId];
  const text = raw === undefined ? (SYMPTOMS.has(intentId) ? DEFAULT_ANSWER.symptom : DEFAULT_ANSWER.history) : (typeof raw === 'function' ? raw(state) : raw);
  return { speaker: h.speaker, text };
}

/**
 * Ask a question. Returns { question, understood, intent, speaker, text }.
 * An empty question returns null. A question that is not understood gets a polite answer
 * and the caller should not charge time for it.
 */
export function ask(def, state, rawQuestion) {
  const question = String(rawQuestion ?? '').trim().slice(0, MAX_QUESTION_LENGTH);
  if (!question) return null;
  const intent = matchIntent(question);
  if (!intent) return { question, understood: false, intent: null, speaker: def.history.speaker, text: DEFAULT_ANSWER.unknown };
  const a = answerFor(def, state, intent);
  return { question, understood: true, intent, ...a };
}
