// Anonymous search log: what people look for, how many results they got, and what they opened.
// No cookies, no IP address, no user id. Free text is scrubbed of emails and phone numbers.
const KINDS = new Set(['search', 'build', 'click']);
let ready = false;

function scrub(s, max) {
  return String(s || '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[מייל]')
    .replace(/\+?\d[\d\s-]{6,}\d/g, '[מספר]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return new Response(null, { status: 204 });          // not connected yet: accept and drop
  const origin = request.headers.get('Origin') || '';
  if (origin && !/^https:\/\/([a-z0-9-]+\.)?skillforyou\.pages\.dev$/.test(origin)) return new Response(null, { status: 403 });
  let d;
  try { d = JSON.parse((await request.text()).slice(0, 4000)); } catch { return new Response(null, { status: 400 }); }
  const kind = String(d.kind || '');
  const q = scrub(d.q, 300);
  if (!KINDS.has(kind) || q.length < 2) return new Response(null, { status: 400 });
  const n = Number.isFinite(+d.n) ? Math.max(0, Math.min(5000, Math.round(+d.n))) : null;
  const tool = scrub(d.tool, 40) || null;
  const skill = scrub(d.skill, 100) || null;
  const country = (request.cf && request.cf.country) || null;
  if (!ready) {
    await env.DB.exec("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL DEFAULT (datetime('now')), kind TEXT NOT NULL, q TEXT NOT NULL, n INTEGER, tool TEXT, skill TEXT, country TEXT)");
    await env.DB.exec('CREATE INDEX IF NOT EXISTS events_ts ON events (ts)');
    ready = true;
  }
  await env.DB.prepare('INSERT INTO events (kind, q, n, tool, skill, country) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(kind, q, n, tool, skill, country).run();
  return new Response(null, { status: 204 });
}

export function onRequest() { return new Response(null, { status: 405 }); }
