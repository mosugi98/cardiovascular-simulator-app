// Linking in and out. Another app can open a case directly and give the learner a way back.
//
// The "Back" link is only allowed to go to the same site as the simulator (or to another local
// development server). A link that accepted any address would let someone craft a simulator link
// that sends a learner anywhere.

const MAX_LABEL = 40;

const isLocalHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1';

/** A short label that is safe to show as text. */
export function cleanLabel(raw) {
  const text = String(raw ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ') // line breaks and tabs become spaces
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LABEL)
    .trim();
  return text || 'the previous page';
}

/**
 * Read the ?return= and ?returnLabel= settings from a query string.
 * Returns { href, label } for an allowed address, or null.
 *
 * `ownOrigin` is the simulator's own origin, for example https://mosugi98.github.io
 */
export function parseReturn(search, ownOrigin) {
  const params = new URLSearchParams(search);
  const raw = params.get('return');
  if (!raw || raw.length > 500) return null;

  let url;
  let own;
  try {
    own = new URL(ownOrigin);
    url = new URL(raw, own); // a relative address such as /cv-mastery/ stays on this site
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;

  const sameSite = url.origin === own.origin;
  const bothLocal = isLocalHost(own.hostname) && isLocalHost(url.hostname);
  if (!sameSite && !bothLocal) return null;

  return { href: url.href, label: cleanLabel(params.get('returnLabel')) };
}
