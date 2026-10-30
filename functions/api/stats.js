// Private summary of the search log. Open /api/stats?key=<STATS_KEY>&days=30
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) return new Response('Not found', { status: 404 });
  if (!env.DB) return Response.json({ error: 'database not connected' }, { status: 503 });
  const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get('days') || '30', 10) || 30));
  const since = `-${days} days`;
  const q = (sql) => env.DB.prepare(sql).bind(since).all().then((r) => r.results).catch(() => []);
  const [totals, top, zero, builds, clicks, tools, countries, daily] = await Promise.all([
    q("SELECT kind, COUNT(*) AS n FROM events WHERE ts >= datetime('now', ?) GROUP BY kind"),
    q("SELECT lower(q) AS q, COUNT(*) AS times, ROUND(AVG(n)) AS avg_results FROM events WHERE kind='search' AND ts >= datetime('now', ?) GROUP BY lower(q) ORDER BY times DESC LIMIT 100"),
    q("SELECT lower(q) AS q, COUNT(*) AS times FROM events WHERE kind IN ('search','build') AND n = 0 AND ts >= datetime('now', ?) GROUP BY lower(q) ORDER BY times DESC LIMIT 100"),
    q("SELECT q, n, tool, ts FROM events WHERE kind='build' AND ts >= datetime('now', ?) ORDER BY ts DESC LIMIT 200"),
    q("SELECT skill, COUNT(*) AS opens, COUNT(DISTINCT lower(q)) AS from_queries FROM events WHERE kind='click' AND ts >= datetime('now', ?) GROUP BY skill ORDER BY opens DESC LIMIT 100"),
    q("SELECT tool, COUNT(*) AS n FROM events WHERE tool IS NOT NULL AND ts >= datetime('now', ?) GROUP BY tool ORDER BY n DESC"),
    q("SELECT country, COUNT(*) AS n FROM events WHERE ts >= datetime('now', ?) GROUP BY country ORDER BY n DESC LIMIT 20"),
    q("SELECT date(ts) AS day, COUNT(*) AS n FROM events WHERE ts >= datetime('now', ?) GROUP BY day ORDER BY day"),
  ]);
  return new Response(JSON.stringify({ days, totals, top_searches: top, no_results: zero, set_builder: builds, opened_after_search: clicks, tools, countries, daily }, null, 2),
    { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
