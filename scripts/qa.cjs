/* Automatic site check. Serves the repo locally, opens every kind of page on phone, tablet and desktop,
   and reports bugs: script errors, content wider than the screen, buttons too small to tap, broken
   internal links, leftover placeholders, and broken data. Also clicks through the main flows.
   Usage: node scripts/qa.cjs            → writes qa-report.md, exits 1 if errors were found */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8899;
const BASE = `http://127.0.0.1:${PORT}/`;
const VIEWPORTS = [
  { name: 'טלפון', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'טאבלט', width: 820, height: 1180, isMobile: true, hasTouch: true },
  { name: 'מחשב', width: 1440, height: 900 },
];
const errors = [];   // must fix
const warnings = []; // worth a look
const add = (list, where, what) => { const k = where + ' | ' + what; if (!list.some((x) => x.k === k)) list.push({ k, where, what }); };

/* ---------- tiny static server ---------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(PORT, '127.0.0.1', () => res(srv));
  });
}

/* ---------- data checks (no browser) ---------- */
function checkData() {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/skills.json'), 'utf8'));
  const app = fs.readFileSync(path.join(ROOT, 'assets/app.js'), 'utf8');
  const needs = new Set([...app.matchAll(/\{ id: '([a-z-]+)', label: '[^']+', color/g)].map((m) => m[1]));
  const ids = new Set();
  for (const s of idx.skills) {
    const w = `נתונים: ${s.id || '(בלי מזהה)'}`;
    if (!s.id) { add(errors, w, 'סקיל בלי מזהה'); continue; }
    if (ids.has(s.id)) add(errors, w, 'מזהה כפול');
    ids.add(s.id);
    for (const k of ['title', 'what', 'need', 'by', 'evShort']) if (!s[k]) add(errors, w, `חסר השדה ${k}`);
    if (s.need && !needs.has(s.need)) add(errors, w, `צורך לא מוכר: ${s.need}`);
    if (!fs.existsSync(path.join(ROOT, 'data/d', s.id + '.json'))) add(errors, w, 'חסר קובץ הפרטים data/d/' + s.id + '.json');
    if (s.url && !/^https:\/\//.test(s.url)) add(warnings, w, 'קישור מקור שלא מתחיל ב־https');
    if (!s.url && !s.cmd) add(warnings, w, 'אין קישור מקור ואין פקודת התקנה');
    if (s.archived) add(warnings, w, 'המאגר בגיטהאב סומן כארכיון');
  }
  for (const s of idx.skills) for (const k of ['pairs', 'alts']) for (const o of s[k] || []) {
    const oid = typeof o === 'string' ? o : o && o.id;
    if (oid && !ids.has(oid)) add(errors, `נתונים: ${s.id}`, `מפנה לסקיל שלא קיים: ${oid}`);
  }
  return { ids, count: idx.skills.length };
}

/* ---------- page checks (inside the browser) ---------- */
async function inspect(page, where, ids) {
  const r = await page.evaluate(() => {
    const W = document.documentElement.clientWidth, out = { wide: document.documentElement.scrollWidth - W, over: [], small: [], tiny: [], links: [], holes: [], dupIds: [] };
    const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o !== 'visible') return true; } return false; };
    const visible = (el) => { const b = el.getBoundingClientRect(); const cs = getComputedStyle(el); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
    const label = (el) => (el.getAttribute('aria-label') || el.textContent || el.className || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
    document.querySelectorAll('#main *, header *, footer *').forEach((el) => {
      if (!visible(el)) return;
      const b = el.getBoundingClientRect();
      if ((b.left < -1 || b.right > W + 1) && !clipped(el) && !el.closest('.skip')) out.over.push(label(el));
    });
    document.querySelectorAll('button, .btn, .chip, .pill, input, textarea, select').forEach((el) => {
      if (!visible(el) || el.closest('.skip')) return;
      const lab = el.closest('label'); const b = (lab && /INPUT/.test(el.tagName) ? lab : el).getBoundingClientRect();
      if (b.width < 24 || b.height < 24) out.small.push(label(el) + ` (${Math.round(b.width)}×${Math.round(b.height)})`);
    });
    const walker = document.createTreeWalker(document.getElementById('main'), NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode());) {
      const t = n.textContent.trim(); if (!t) continue;
      const el = n.parentElement; if (!visible(el)) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) out.tiny.push(t.slice(0, 30) + ` (${fs}px)`);
      if (/\[(שם|כתובת|מספר|תאריך|מייל|TODO)[^\]]*\]|\bundefined\b|\bNaN\b|\[object /.test(t)) out.holes.push(t.slice(0, 60));
    }
    document.querySelectorAll('a[href^="#/skill/"]').forEach((a) => out.links.push(decodeURIComponent(a.getAttribute('href').slice(8))));
    const seen = {}; document.querySelectorAll('[id]').forEach((e) => { if (seen[e.id]) out.dupIds.push(e.id); seen[e.id] = 1; });
    return out;
  });
  if (r.wide > 1) add(errors, where, `העמוד רחב מהמסך ב־${r.wide}px (גורם להקטנה בטלפון)`);
  r.over.slice(0, 3).forEach((x) => add(errors, where, `אלמנט חורג מרוחב המסך: ${x}`));
  r.small.slice(0, 5).forEach((x) => add(errors, where, `כפתור קטן מ־24×24, קשה ללחוץ: ${x}`));
  r.tiny.slice(0, 3).forEach((x) => add(warnings, where, `טקסט קטן מ־12px: ${x}`));
  r.holes.forEach((x) => add(errors, where, `טקסט שבור או מקום ריק שלא מולא: ״${x}״`));
  [...new Set(r.links)].filter((id) => !ids.has(id)).forEach((id) => add(errors, where, `קישור לסקיל שלא קיים: ${id}`));
  [...new Set(r.dupIds)].forEach((id) => add(warnings, where, `id כפול בעמוד: ${id}`));
}

async function main() {
  const { ids, count } = checkData();
  const srv = await serve();
  const browser = await chromium.launch();
  const sample = [...ids].filter((_, i) => i % 37 === 0).slice(0, 30); // spread across the catalog
  let pagesChecked = 0;
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch, reducedMotion: 'reduce' });
    await ctx.route(/fonts\.googleapis|fonts\.gstatic|cloudflareinsights|formspree/, (r) => r.abort());
    const page = await ctx.newPage();
    let cur = '';
    page.on('pageerror', (e) => add(errors, `${vp.name} ${cur}`, 'שגיאת JavaScript: ' + e.message.slice(0, 120)));
    page.on('console', (m) => { if (m.type() === 'error' && !/net::ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text())) add(errors, `${vp.name} ${cur}`, 'שגיאה בקונסול: ' + m.text().slice(0, 120)); });
    const go = async (hash, wait = 350) => {
      cur = hash || '#/';
      if (page.url().startsWith(BASE)) { await page.evaluate((h) => { location.hash = h; }, hash || '#/'); }
      else { await page.goto(BASE + (hash || '')); await page.waitForFunction(() => document.querySelector('#main') && !/טוען/.test(document.querySelector('#main').textContent) && document.querySelector('#main').children.length, null, { timeout: 15000 }); }
      await page.waitForTimeout(wait);
      pagesChecked++;
      await inspect(page, `${vp.name} ${cur}`, ids);
    };

    await go('#/', 900);
    // guides list → every guide
    await go('#/guides');
    const guides = await page.$$eval('a[href^="#/guide/"]', (a) => a.map((x) => x.getAttribute('href')));
    for (const g of guides) await go(g);
    for (const h of ['#/build', '#/students', '#/models', '#/updates', '#/legal/terms', '#/legal/report', '#/no-such-page']) await go(h);
    for (const id of (vp.name === 'מחשב' ? sample : sample.slice(0, 10))) await go('#/skill/' + encodeURIComponent(id), 500);

    /* ---------- flows ---------- */
    const flow = async (name, fn) => { cur = 'תהליך: ' + name; try { await fn(); } catch (e) { add(errors, `${vp.name} תהליך: ${name}`, 'נכשל: ' + e.message.split('\n')[0].slice(0, 140)); } };
    await flow('חיפוש בקטלוג', async () => {
      await go('#/');
      await page.fill('#q', 'מצגת'); await page.waitForTimeout(500);
      const n = await page.$$eval('#catalog .card', (c) => c.length);
      if (!n) throw new Error('חיפוש ״מצגת״ לא החזיר תוצאות');
      await page.fill('#q', 'qwzxqwzx'); await page.waitForTimeout(500);
      if (!(await page.$('#catalog form.req'))) throw new Error('חיפוש בלי תוצאות לא מציג את טופס הבקשה');
      await page.fill('#q', ''); await page.waitForTimeout(400);
    });
    await flow('סינון ומיון', async () => {
      await go('#/');
      if (vp.width <= 700) {
        await page.click('.fbar .btn');
        await page.waitForSelector('#filters.open', { timeout: 3000 });
      }
      const before = await page.$eval('#catalog .sec-head span', (e) => e.textContent);
      await page.click('#filters [data-act=need][data-v=docs]');
      await page.click('#filters [data-act=fam][data-v=claude]');
      await page.click('#filters [data-act=sort][data-v=pop]');
      const after = await page.$eval('#catalog .sec-head span', (e) => e.textContent);
      if (before === after) throw new Error('הסינון לא שינה את מספר התוצאות');
      await inspect(page, `${vp.name} סינון פתוח`, ids);
      if (vp.width <= 700) await page.click('#filters [data-act=fclear]');
      else for (const s of ['[data-act=need][data-v=all]', '[data-act=fam][data-v=all]', '[data-act=sort][data-v=rec]']) await page.click('#filters ' + s);
      if ((await page.$eval('#catalog .sec-head span', (e) => e.textContent)) !== before) throw new Error('הניקוי לא החזיר את כל הסקילים');
      if (vp.width <= 700) { await page.click('.sheet-foot .btn.pink'); if (await page.$('#filters.open')) throw new Error('החלונית לא נסגרה'); }
    });
    if (vp.width <= 700) await flow('תפריט המבורגר', async () => {
      await go('#/');
      await page.click('#menubtn');
      if (!(await page.$('#nav.open'))) throw new Error('התפריט לא נפתח');
      await page.click('#nav a[href="#/models"]'); await page.waitForTimeout(300);
      if (!/models/.test(page.url())) throw new Error('לחיצה בתפריט לא עברה עמוד');
      if (await page.$('#nav.open')) throw new Error('התפריט נשאר פתוח אחרי מעבר עמוד');
    });
    await flow('בנו לי סט', async () => {
      await go('#/build');
      for (const q of ['להפוך PDF לוורד ולכתוב מיילים ללקוחות', 'מכין פרזנטציות מדוחות אקסל', 'אני סטודנט לפסיכולוגיה וצריך עזרה בסטטיסטיקה']) {
        await page.fill('#bq', q); await page.click('#buildform [type=submit]'); await page.waitForTimeout(400);
        const n = await page.$$eval('#results .card', (c) => c.length);
        if (!n) throw new Error(`לא הורכב סט עבור ״${q}״`);
        if (n > 6) add(warnings, `${vp.name} בנו לי סט`, `הורכב סט גדול (${n}) עבור ״${q}״`);
      }
      await inspect(page, `${vp.name} תוצאות בנו לי סט`, ids);
    });
    await flow('לשוניות מודלים', async () => {
      await go('#/models');
      const tabs = await page.$$('.mtab');
      for (const t of tabs) { await t.click(); await page.waitForTimeout(250); }
      if (!(await page.$('details.mdl'))) throw new Error('אין מודלים בלשונית');
    });
    await flow('עמוד סקיל: פרטי התקנה', async () => {
      await go('#/skill/' + encodeURIComponent(sample[0]), 600);
      const b = await page.$('[data-act=install]');
      if (b) { await b.click(); await page.waitForTimeout(300); if (!(await page.$('#installbox'))) throw new Error('תיבת ההתקנה לא נפתחה'); }
    });
    await ctx.close();
  }
  await browser.close();
  srv.close();

  /* ---------- report ---------- */
  const fmt = (l) => l.map((x) => `- **${x.where}**: ${x.what}`).join('\n');
  const md = `# בדיקת אתר אוטומטית\n\n${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC · ${count} סקילים · ${pagesChecked} עמודים נבדקו בטלפון, טאבלט ומחשב\n\n` +
    `## שגיאות (${errors.length})\n\n${errors.length ? fmt(errors) : 'אין 🎉'}\n\n## לבדיקה (${warnings.length})\n\n${warnings.length ? fmt(warnings.slice(0, 80)) + (warnings.length > 80 ? `\n- ועוד ${warnings.length - 80}` : '') : 'אין'}\n`;
  fs.writeFileSync(path.join(ROOT, 'qa-report.md'), md);
  console.log(md);
  process.exit(errors.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
