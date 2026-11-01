/* SkillForYou – static site. Hash routing, no build step. */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var $ = function (s) { return document.querySelector(s); };

  var NEEDS = [
    { id: 'all', label: 'הכול', color: '#FFFFFF' },
    { id: 'docs', label: 'מסמכים', color: '#7CD8FF' },
    { id: 'data', label: 'טבלאות ונתונים', color: '#9BE38A' },
    { id: 'slides', label: 'מצגות', color: '#FFB86B' },
    { id: 'office', label: 'מייל ומשימות', color: '#FFE08A' },
    { id: 'writing', label: 'כתיבה ומחקר', color: '#D7B8FF' },
    { id: 'business', label: 'עסק וכספים', color: '#FFC2D1' },
    { id: 'marketing', label: 'שיווק ומכירות', color: '#B8F0E6' },
    { id: 'design', label: 'עיצוב ומדיה', color: '#FF9E7A' },
    { id: 'dev', label: 'פיתוח', color: '#C9D3FF' },
    { id: 'security', label: 'אבטחה', color: '#FF9E9E' },
    { id: 'tokens', label: 'חיסכון בטוקנים', color: '#E6E6E6' },
    { id: 'study', label: 'לימודים', color: '#C8F7C5' }
  ];
  var C = {}; NEEDS.forEach(function (n) { C[n.id] = n; });
  var TILTS = ['tilt-a', 'tilt-b', 'tilt-c', 'tilt-d'];
  var TOOLS = ['Claude', 'Claude Code', 'Cursor', 'Codex'];

  var STEPS = {
    app: [
      'נכנסים למקור של הסקיל ומורידים את התיקייה שלו.',
      'פותחים את ההגדרות באפליקציה של ה־AI ומעלים את הסקיל באזור הסקילים.',
      'פותחים שיחה חדשה ומבקשים כרגיל. לא צריך להפעיל את הסקיל ידנית.'
    ],
    code: [
      'מעתיקים את פקודת ההתקנה שבתיבה למטה.',
      'מריצים אותה בכלי שבו אתה עובד, למשל Claude Code.',
      'מבקשים כרגיל. הסקיל נטען לבד כשהוא רלוונטי.'
    ]
  };

  var GUIDES = [
    { id: 'small-business', title: 'הסקילים הכי טובים לבעלי עסק קטן', short: 'מיילים, חוזים ותזרים. שלושה סקילים שמכסים את רוב הניירת.', color: '#FFC2D1',
      intro: 'רוב הזמן של בעל עסק קטן הולך על מיילים, על חוזים ועל השאלה אם יהיה מספיק כסף בסוף החודש. שלושת הסקילים האלה מכסים את זה, כולם של Anthropic.',
      items: [['inbox', 'ממיין את התיבה למה שבאמת דורש אותך, ומנסח טיוטות שמחכות לאישור שלך.'], ['contract', 'בדיקה ראשונה של NDA או חוזה ספק לפני שמעבירים לעורך דין.'], ['cash', 'תחזית ל־30, 60 ו־90 יום, כדי לראות מראש חודש צפוף.']],
      skip: 'לא צריך גם את סקיל ה־Gmail. ״סידור תיבת הדואר״ כבר מטפל במיילים, ושני סקילים לאותה משימה רק מבלבלים את ה־AI.' },
    { id: 'documents', title: 'הסקילים הכי טובים לעבודה עם מסמכים', short: 'PDF ו־Word. שניים מספיקים לרוב העבודה המשרדית.', color: '#7CD8FF',
      intro: 'אם רוב העבודה שלך היא קבצים שמגיעים ויוצאים, מספיקים שני סקילים: אחד שקורא ומפרק קבצי PDF, ואחד שכותב מסמכי Word מסודרים.',
      items: [['pdf', 'מחבר, מפצל, ממלא טפסים ומוציא טבלאות מתוך PDF.'], ['docx', 'מסמכים עם כותרות, טבלאות והערות, שנפתחים ב־Word בלי הפתעות.']],
      skip: 'אם אתם לא עובדים עם טבלאות, אין צורך בסקיל ה־Excel. תוסיפו אותו כשיהיה צורך.' },
    { id: 'writing', title: 'הסקילים הכי טובים לכתיבה', short: 'טקסט שנשמע כמוך, ולא כמו AI.', color: '#D7B8FF',
      intro: 'לכתיבה לא צריך הרבה. סקיל אחד שמנקה דפוסים של AI עושה את רוב העבודה, וסקיל Word עוזר כשהטקסט צריך לצאת כמסמך.',
      items: [['noslop', 'מוריד יותר מ־20 דפוסים של כתיבת AI, בלי לשנות את מה שרצית להגיד.'], ['docx', 'כשהטקסט צריך לצאת כמסמך מסודר.']],
      skip: 'אל תתקינו כמה סקילים שמשנים את סגנון הכתיבה, למשל שני סקילים שונים נגד "ריח של AI". כל אחד נותן ל־AI הוראות קצת אחרות, והטקסט יוצא לא עקבי. אחד מספיק.' },
    { id: 'ui', title: 'הסקילים הכי טובים לעיצוב ממשקים', short: 'שני סקילים מצוינים. בוחרים אחד.', color: '#FF9E7A',
      intro: 'יש שני סקילים מצוינים לליטוש ממשק, והם חופפים. בחרו אחד לפי הכלי והסגנון שלכם.',
      items: [['emil', 'אם אתם עובדים ב־React עם Claude Code, ורוצים רף גבוה של תנועה ותחושה.'], ['feel', 'אם אתם עובדים ב־Cursor או Codex, או רוצים תיקונים קטנים ומעשיים.']],
      skip: 'אל תתקינו את שניהם. הם נוגעים באותם דברים, וה־AI יקבל הנחיות סותרות.' },
    { id: 'excel-to-slides', title: 'איך בונים מצגת מדוח באקסל', short: 'מהגיליון לשקפים, בשני סקילים.', color: '#FFB86B',
      intro: 'הסקיל הראשון קורא ומסכם את הגיליון, והשני הופך את הסיכום למצגת. ככה כל אחד עושה את מה שהוא טוב בו.',
      items: [['xlsx', 'קורא את הנתונים, מוצא את המספרים החשובים ובונה גרפים.'], ['pptx', 'שקף לכל רעיון, עם כותרות שאומרות את המסקנה.']],
      skip: 'לא צריך את סקיל ה־Word בשביל זה. וגם לא את ״ניקוי טבלה״, אלא אם הקובץ באמת מבולגן.' }
  ];

  var ICON = {
    x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    filter: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>',
    fwd: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"></path><path d="M9 12l2 2 4-4"></path></svg>'
  };
  var mark = function (d) { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; };

  var S = [], byId = {}, byKey = {}, byOv = {};
  var st = { sheet: false, mfam: 'claude', q: '', need: 'all', sort: 'rec', fam: 'all', anyTool: false, level: 'everyday', shown: 24, bq: '', built: '', tool: '', install: false, adv: false };

  /* ---------- search ---------- */
  var engine = null;
  // which AI tool families a skill says it works with (from its own documentation)
  var FAMS = [
    { id: 'all', label: 'כל הכלים', color: '#fff' },
    { id: 'claude', label: 'Claude', color: '#FFB86B', re: /claude|cowork/i },
    { id: 'openai', label: 'ChatGPT / Codex', color: '#9BE38A', re: /codex|chatgpt|openai/i },
    { id: 'gemini', label: 'Gemini', color: '#7CD8FF', re: /gemini|antigravity/i },
    { id: 'cursor', label: 'Cursor', color: '#D7B8FF', re: /cursor/i },
    { id: 'copilot', label: 'Copilot', color: '#FFC2D1', re: /copilot|vs ?code/i }
  ];
  var SORTS = [
    { id: 'rec', label: 'מומלץ', color: '#fff' },
    { id: 'pop', label: 'הכי פופולרי', color: '#fff' },
    { id: 'need', label: 'לפי צורך', color: '#fff' },
    { id: 'new', label: 'עודכן לאחרונה', color: '#fff' }
  ];
  function famsOf(s) {
    var stated = (s.works || []).concat(s.ft || []);
    if (stated.some(function (w) { return /any agent skills/i.test(w); })) return 'any';
    var out = {}; FAMS.forEach(function (f) { if (f.re && stated.some(function (w) { return f.re.test(w); })) out[f.id] = 1; });
    return stated.length ? out : null;
  }
  function popScore(s) { return (s.installs || 0) * 10 + (s.stars || 0); }
  function needFilter(s) { return st.need === 'all' || s.need === st.need; }
  function famOk(s) {
    if (st.fam === 'all' || s._fam === 'any') return true;
    if (!s._fam) return st.anyTool;
    return !!s._fam[st.fam];
  }
  function filtered() {
    var q = st.q.trim(), base;
    if (q && engine) base = engine.search(q).map(function (r) { return S[r.idx]; }).filter(needFilter);
    else base = S.filter(needFilter);
    var list = base.filter(famOk);
    list.unstated = st.fam !== 'all' && !st.anyTool ? base.filter(function (s) { return !s._fam; }).length : 0;
    var order = {}; NEEDS.forEach(function (n, i) { order[n.id] = i; });
    var idx = {}; list.forEach(function (s, i) { idx[s.id] = i; });
    if (st.sort === 'pop') list.sort(function (a, b) { return popScore(b) - popScore(a) || idx[a.id] - idx[b.id]; });
    else if (st.sort === 'need') list.sort(function (a, b) { return (order[a.need] - order[b.need]) || popScore(b) - popScore(a); });
    else if (st.sort === 'new') list.sort(function (a, b) { return String(b.updated || '').localeCompare(String(a.updated || '')) || idx[a.id] - idx[b.id]; });
    return list;
  }
  var SITE = 'https://skillforyou.pages.dev/';
  function askAI(text, tool) {
    var prompt = 'אני מחפש סקילים (SKILL.md) לכלי ה־AI שלי' + (tool ? ' (' + tool + ')' : '') + '. זה מה שאני צריך: ' + text +
      '\nתעבור על הקטלוג של SkillForYou בכתובת ' + SITE + 'llms.txt ותמליץ לי על סקיל אחד לכל צורך, בלי סקילים חופפים. לכל סקיל תסביר במשפט למה הוא מתאים ותצרף את הקישור לעמוד שלו.';
    var e = encodeURIComponent(prompt);
    return '<div class="box" style="background:var(--purple)"><strong style="font-family:var(--head);font-weight:400;font-size:19px">רוצים לנסח חופשי לגמרי?</strong>' +
      '<span style="font-size:16px">תשאלו את ה־AI שלכם. הכנו לו את השאלה, כולל הקישור לקטלוג שלנו.</span>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px"><a class="btn shadow" target="_blank" rel="noopener" href="https://claude.ai/new?q=' + e + '">לשאול את Claude ↗</a>' +
      '<a class="btn shadow" target="_blank" rel="noopener" href="https://chatgpt.com/?q=' + e + '">לשאול את ChatGPT ↗</a></div></div>';
  }

  /* ---------- pieces ---------- */
  function card(s, i) {
    return '<a class="card ' + TILTS[i % 4] + '" href="#/skill/' + esc(s.id) + '" style="animation-delay:' + Math.min(i, 12) * 0.04 + 's">' +
      '<span class="row"><span class="tag" style="background:' + C[s.need].color + '">' + esc(C[s.need].label) + '</span>' +
      (s.official ? '<span class="official">' + ICON.shield + 'רשמי</span>' : '') + '</span>' +
      '<span class="t">' + esc(s.title) + '</span>' +
      '<span class="w">' + esc(s.what) + '</span>' +
      (s.ask ? '<span class="ask">״' + esc(s.ask) + '״</span>' : '') +
      '<span class="foot"><span>' + esc(s.by) + ' · ' + esc(s.evShort) + '</span><span style="font-weight:800">לפרטים</span></span></a>';
  }
  function chips(list, act, cur) {
    return list.map(function (n) {
      return '<button type="button" class="chip" data-act="' + act + '" data-v="' + esc(n.id) + '" aria-pressed="' + (n.id === cur) + '" style="background:' + n.color + '">' + esc(n.label) + '</button>';
    }).join('');
  }
  var requestBox = function (prefill) {
    return '<div class="box shadow" style="align-items:flex-start">' +
      '<strong style="font-family:var(--head);font-weight:400;font-size:21px">עוד אין לנו סקיל לזה.</strong>' +
      '<span style="font-size:16px">ספר לנו מה ניסית לעשות, ונחפש סקיל מתאים. ככה אנחנו יודעים מה להוסיף לקטלוג.</span>' +
      '<form class="req" data-type="request" style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:640px"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden">' +
      '<label class="field">מה ניסית לעשות?<textarea name="need" rows="3" placeholder="למשל: לסכם הקלטה של פגישה ולשלוח לצוות">' + esc(prefill || '') + '</textarea></label>' +
      '<label class="field">באיזה כלי AI אתה עובד? (רשות)<input name="tool" type="text" placeholder="למשל: Claude, ChatGPT, Cursor"></label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px"><button type="submit" class="btn pink head">שליחה</button>' +
      '<button type="button" class="btn yellow" data-act="clear">לראות את כל הסקילים</button></div></form></div>';
  };

  /* ---------- home ---------- */
  function catalogBody() {
    var list = filtered();
    var q = st.q.trim();
    var heading = q ? 'תוצאות עבור ״' + q + '״' : st.need !== 'all' ? 'סקילים ל' + C[st.need].label : 'כל הסקילים';
    var sorts = SORTS.map(function (x) { return x.id === 'rec' && q ? { id: 'rec', label: 'הכי מתאים', color: '#fff' } : x; });
    var shown = list.slice(0, st.shown), grid;
    if (st.sort === 'need' && st.need === 'all') {
      var groups = [];
      shown.forEach(function (s) { var g = groups[groups.length - 1]; if (!g || g.need !== s.need) groups.push(g = { need: s.need, items: [] }); g.items.push(s); });
      grid = groups.map(function (g) {
        return '<h3 style="font-family:var(--head);font-weight:400;font-size:20px;margin-top:8px"><span class="tag" style="background:' + C[g.need].color + ';font-size:inherit;font-family:inherit">' + esc(C[g.need].label) + '</span></h3><div class="grid">' + g.items.map(card).join('') + '</div>';
      }).join('');
    } else grid = '<div class="grid">' + shown.map(card).join('') + '</div>';
    return '<div class="sec-head"><h2>' + esc(heading) + '</h2><span style="font-size:15px;font-weight:700" aria-live="polite">' + list.length + ' סקילים</span></div>' +
      filterBlock(sorts, list.length) +
      (list.unstated ? '<p class="note" style="font-size:14px">עוד ' + list.unstated + ' סקילים לא מציינים בתיעוד עם אילו כלים הם עובדים. הפורמט פתוח, אז רובם יעבדו גם ב־' + esc(FAMS.filter(function (f) { return f.id === st.fam; })[0].label) + '. <button type="button" class="linkbtn" data-act="anytool" style="font:inherit;font-weight:800;text-decoration:underline;background:none;border:0;cursor:pointer;padding:0 2px;min-height:28px;display:inline-flex;align-items:center">להציג גם אותם</button></p>' : '') +
      (st.sort === 'pop' ? '<p class="note" style="font-size:14px">לפי מספר ההתקנות ב־skills.sh, ואחריו לפי הכוכבים בגיטהאב.</p>' : '') +
      (list.length ? grid +
        (list.length > st.shown ? '<button type="button" class="btn shadow more" data-act="more">להציג עוד (' + (list.length - st.shown) + ')</button>' : '')
        : requestBox(q) + (q ? askAI(q, '') : ''));
  }
  // filters: inline rows on desktop; on mobile a single button that opens a bottom sheet
  function filterBlock(sorts, n) {
    var active = (st.need !== 'all' ? 1 : 0) + (st.fam !== 'all' ? 1 : 0) + (st.sort !== 'rec' ? 1 : 0);
    var sum = [st.need !== 'all' ? C[st.need].label : '', st.fam !== 'all' ? FAMS.filter(function (f) { return f.id === st.fam; })[0].label : '',
      st.sort !== 'rec' ? sorts.filter(function (x) { return x.id === st.sort; })[0].label : ''].filter(Boolean).join(' · ');
    return '<div class="fbar"><button type="button" class="btn shadow" data-act="sheet" aria-expanded="' + st.sheet + '" aria-controls="filters">' + ICON.filter + 'סינון ומיון' + (active ? ' <span class="fcount">' + active + '</span>' : '') + '</button>' +
      (sum ? '<span class="fsum">' + esc(sum) + '</span>' : '') + '</div>' +
      '<div class="fbackdrop' + (st.sheet ? ' open' + (st.sheetAnim ? ' anim' : '') : '') + '" data-act="sheet"></div>' +
      '<div class="filters' + (st.sheet ? ' open' + (st.sheetAnim ? ' anim' : '') : '') + '" id="filters" role="group" aria-label="סינון ומיון">' +
      '<div class="sheet-head"><strong>סינון ומיון</strong><button type="button" class="sheet-x" data-act="sheet" aria-label="סגירה">✕</button></div>' +
      '<div class="row-chips scroll" role="group" aria-label="סינון לפי צורך"><span class="lbl-m">צורך:</span>' + chips(NEEDS, 'need', st.need) + '</div>' +
      '<div class="row-chips scroll" role="group" aria-label="סינון לפי כלי AI"><span>עובד עם:</span>' + chips(FAMS, 'fam', st.fam) + '</div>' +
      '<div class="row-chips scroll" role="group" aria-label="מיון"><span>מיון:</span>' + chips(sorts, 'sort', st.sort) + '</div>' +
      '<div class="sheet-foot"><button type="button" class="btn" data-act="fclear">ניקוי</button><button type="button" class="btn pink" data-act="sheet">להציג ' + n + ' סקילים</button></div></div>';
  }
  function home() {
    var tries = [['לחבר קבצי PDF', 'PDF'], ['מצגת', 'מצגת'], ['מיילים', 'מייל'], ['הכנה למבחן', 'הכנה למבחן'], ['רגרסיה', 'רגרסיה']];
    return '<div class="wrap page" style="gap:56px">' +
      '<section class="hero in"><h1>תן ל־AI<br>כוח־על חדש.</h1>' +
      '<p class="lead">סקיל הוא תוסף קטן שמלמד את ה־AI לעשות משהו אחד ממש טוב. כתוב מה אתה צריך, ונמצא לך את הסקיל המתאים.</p>' +
      '<form class="search" role="search" id="searchform"><label for="q" class="sr">מה אתה רוצה שה־AI יעשה?</label>' +
      '<span class="qwrap' + (st.q ? ' has' : '') + '"><input id="q" type="search" autocomplete="off" value="' + esc(st.q) + '" placeholder="מה אתה רוצה שה־AI ידע לעשות?">' +
      '<button type="button" class="qclear" data-act="qclear" aria-label="ניקוי החיפוש">' + ICON.x + '</button></span>' +
      '<button type="submit" class="btn pink big">יאללה</button></form>' +
      '<div class="row-chips"><span>נסו:</span>' + tries.map(function (t) {
        return '<button type="button" class="chip dashed" data-act="try" data-v="' + esc(t[1]) + '">' + esc(t[0]) + '</button>';
      }).join('') + '</div>' +
      '<a class="btn shadow" href="#/build" style="min-height:44px;border-radius:18px"><span>צריך כמה דברים? <strong style="font-family:var(--head);font-weight:400">נרכיב לך סט בלי כפילויות</strong></span>' + ICON.fwd + '</a></section>' +
      '<section id="catalog" style="display:flex;flex-direction:column;gap:24px">' + catalogBody() + '</section>' +
      '<section class="steps3"><div style="grid-column:1/-1"><h2 style="font-size:var(--h2)">איך זה עובד</h2></div>' +
      step('#7CD8FF', 1, 'מוצאים', 'כותבים מה רוצים לעשות, או בוחרים צורך.') +
      step('#9BE38A', 2, 'מתקינים', 'מורידים את הסקיל מהמקור ומעלים אותו לאפליקציה.') +
      step('#FFB86B', 3, 'מבקשים', 'כותבים ל־AI כרגיל. הוא משתמש בסקיל לבד כשצריך.') + '</section>' +
      '<section class="less"><div style="display:flex;flex-direction:column;gap:12px;max-width:760px"><h2>פחות סקילים, יותר תוצאות</h2>' +
      '<p style="font-size:17px;line-height:1.6">באתרים אחרים מציעים להוריד חבילה שלמה של עשרות סקילים בבת אחת. זה נשמע נוח, אבל בדרך כלל זה עובד פחות טוב.</p></div>' +
      '<div class="cols"><div><strong>כפילויות מבלבלות</strong><span style="font-size:16px">בחבילות יש הרבה סקילים שעושים כמעט אותו דבר. כשיש שניים לאותה משימה, ה־AI לא תמיד יודע באיזה לבחור.</span></div>' +
      '<div><strong>כל סקיל תופס מקום</strong><span style="font-size:16px">ה־AI צריך לדעת על כל סקיל שמותקן אצלך, גם על אלה שלא תשתמש בהם אף פעם.</span></div>' +
      '<div style="background:var(--pink)"><strong>קחו רק מה שאתם צריכים</strong><span style="font-size:16px">תתחילו מהדבר שאתם עושים הכי הרבה, תתקינו סקיל אחד בשבילו, ותוסיפו עוד רק כשיש צורך.</span></div></div></section></div>';
  }
  function step(bg, n, t, d) {
    return '<div class="step" style="background:' + bg + '"><span class="num">' + n + '</span><strong>' + t + '</strong><span style="font-size:16px">' + d + '</span></div>';
  }

  /* ---------- skill page ---------- */
  function skillPage(s) {
    if (!s) return notFound();
    var trust = [
      s.official ? ['פורסם על ידי ' + s.by + ', מפרסם רשמי', '#9BE38A', 'M5 12l5 5 9-10'] : ['פורסם על ידי ' + s.by + ', יוצר עצמאי', '#FFE08A', 'M12 7v6M12 17h.01'],
      s.evidence === 'ממפרסם רשמי' ? null : [s.evidence + ': ' + s.evDetail, '#9BE38A', 'M5 12l5 5 9-10']
    ].filter(Boolean);
    if (s.updated) {
      var days = Math.floor((Date.now() - new Date(s.updated + 'T00:00:00').getTime()) / 864e5);
      var d = s.updated.split('-'); var shown = d[2] + '.' + d[1] + '.' + d[0];
      trust.push(days > 180 ? ['לא עודכן יותר מחצי שנה. עדכון אחרון בריפו: ' + shown, '#FFB86B', 'M12 7v6M12 17h.01']
        : ['עדכון אחרון בריפו: ' + shown, '#9BE38A', 'M5 12l5 5 9-10']);
    }
    var overlaps = s.ov ? (byOv[s.ov] || []).filter(function (o) { return o.id !== s.id && o.altStatus !== 'dup'; })
      .sort(function (a, b) { return (a.altRank || 99) - (b.altRank || 99) || (b.installs || 0) - (a.installs || 0); }).slice(0, 4) : [];
    var pairs = (s.pairs || []).map(function (k) { return byKey[k]; }).filter(Boolean);
    var details = [
      ['שם טכני', s.name, 'mono'], ['מקור', s.repo, 'mono'], ['רישיון', s.license || 'לפי הריפו', ''],
      ['פופולריות', s.evDetail, ''], ['פקודת התקנה', s.cmd, 'mono'], ['ביצועים', 'לא נמצאו נתוני בנצ׳מרק ציבוריים', '']
    ];
    if (s.desc) details.push(['התיאור המקורי', s.desc, '']);
    if (s.cmdNote) details.push(['שימו לב', s.cmdNote, '']);
    var ex = s.examples && s.examples.length ? s.examples : (s.ask ? [{ ask: s.ask }] : []);
    var steps = STEPS[s.steps || 'code'];

    return '<div class="wrap page" style="gap:34px;padding-top:12px">' +
      '<a class="btn back" href="#/">' + ICON.back + 'חזרה לקטלוג</a>' +
      '<section class="skill-hero in"><div class="main">' +
      '<span class="tag" style="align-self:flex-start;background:' + C[s.need].color + '">' + esc(C[s.need].label) + '</span>' +
      '<h1>' + esc(s.title) + '</h1><p style="font-size:17px;line-height:1.5;font-weight:500;max-width:700px">' + esc(s.what) + '</p>' +
      (s.why ? '<p style="font-size:16px;line-height:1.6;max-width:720px;color:#2A2A2A"><strong>למה זה עוזר: </strong>' + esc(s.why) + '</p>' : '') +
      (s.best && s.best.length ? '<div class="row-chips"><span style="font-weight:700">מתאים במיוחד ל:</span>' + s.best.map(function (b) {
        return '<span class="tag" style="background:var(--cream);font-weight:600">' + esc(b) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="row-chips" style="font-weight:400"><span>מאת <strong>' + esc(s.by) + '</strong></span>' +
      (s.official ? '<span class="dark-tag">מפרסם רשמי</span>' : '') + (s.evidence !== 'ממפרסם רשמי' ? '<span class="tag">' + esc(s.evidence) + '</span>' : '') + '</div></div>' +
      '<button type="button" class="btn pink big install" data-act="install" aria-expanded="' + st.install + '" aria-controls="installbox">להתקנה</button></section>' +
      (st.install ? installBox(s) : '') +
      '<div class="cols2"><div class="main">' +
      (ex.length ? '<section class="box"><h2>מה אפשר לבקש</h2>' + ex.map(function (e, i) {
        return '<div class="conv"><span class="bub-me" style="animation-delay:' + (0.15 + i * 0.4) + 's">״' + esc(e.ask) + '״</span>' +
          (e.get ? '<span class="bub-ai" style="animation-delay:' + (0.4 + i * 0.4) + 's">' + esc(e.get) + '</span>' : '') + '</div>';
      }).join('') + '</section>' : '') +
      (s.does && s.does.length ? '<section class="box"><h2>מה הוא עושה בפועל</h2><ul class="ticks">' + s.does.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></section>' : '') +
      (s.how && s.how.length ? '<section class="box" style="background:var(--cream)"><h2>איך עובדים איתו</h2><ol class="st">' + s.how.map(function (t, i) {
        return '<li><span class="num" style="background:var(--yellow)">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ol></section>' : '') +
      '<section class="box" style="background:var(--green)"><h2>איך מתקינים</h2><ol class="st">' + steps.map(function (t, i) {
        return '<li><span class="num">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ol></section>' +
      (s.tryAsk ? '<section class="box" style="background:var(--blue)"><div><h2>נסו את זה</h2><span style="font-size:16px">אחרי ההתקנה, בקשו את זה ותבדקו את התוצאה. זה לוקח כמה דקות.</span></div>' +
        '<div class="try-q"><p>״' + esc(s.tryAsk) + '״</p><button type="button" data-act="copy" data-v="' + esc(s.tryAsk) + '" aria-label="העתקת הבקשה">העתקה</button></div>' +
        '<div class="two"><div><strong style="font-size:16px">ככה נראית תוצאה טובה</strong><ul>' + (s.good || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' +
        '<div><strong style="font-size:16px">סימנים שמשהו לא עובד</strong><ul>' + (s.bad || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div></div></section>' : '') +
      (s.nots && s.nots.length ? '<section class="box"><h2>מה הוא לא עושה</h2><ul>' + s.nots.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></section>' : '') +
      '<section style="display:flex;flex-direction:column;gap:12px"><button type="button" class="btn shadow" style="align-self:flex-start" data-act="adv" aria-expanded="' + st.adv + '" aria-controls="adv">' +
      '<span style="display:inline-flex;transition:transform .25s ease;' + (st.adv ? 'transform:rotate(180deg)' : '') + '">' + ICON.chev + '</span>פרטים למתקדמים</button>' +
      (st.adv ? '<div class="details in" id="adv">' + details.map(function (d) {
        return '<span>' + esc(d[0]) + '</span><span dir="auto" class="' + d[2] + '" style="overflow-wrap:anywhere">' + esc(d[1]) + '</span>'; }).join('') + '</div>' : '') + '</section>' +
      '</div><aside>' +
      '<section class="box sm shadow"><h2>עובד עם</h2>' + (s.works && s.works.length ? '<div class="works">' + s.works.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div><span class="note">לפי מה שכתוב בתיעוד של הסקיל.</span>' : '<span class="note">עוד לא בדקנו בתיעוד של הסקיל עם אילו כלים הוא עובד.</span>') +
      '</section>' +
      '<section class="box sm"><h2>האם זה בטוח</h2>' + trust.map(function (t) {
        return '<div class="trust"><span class="dot" style="background:' + t[1] + '">' + mark(t[2]) + '</span><span>' + esc(t[0]) + '</span></div>'; }).join('') + '</section>' +
      '<section class="box sm" style="background:var(--cream);padding:20px 24px"><strong style="font-size:16px">מצאת בעיה בסקיל? אתה היוצר?</strong><a class="btn" style="align-self:flex-start;min-height:40px" href="#/legal/report">לדיווח או לבקשת עדכון</a></section>' +
      '<section class="box sm" style="background:var(--purple)"><h2>מה צריך כדי שיעבוד</h2><span style="font-size:15px">' + esc(s.needs || 'עוד לא בדקנו. הפרטים נמצאים במקור של הסקיל.') + '</span></section>' +
      (overlaps.length ? '<section class="box sm" style="background:#FFF6D1"><h2>חלופות</h2><span style="font-size:15px">הסקילים האלה עושים משימה דומה. בחרו אחד, לפי מה שמתאים לכם.</span>' +
        (s.choose ? '<div class="alt-row" style="background:var(--cream);border-color:transparent"><strong style="font-size:14px">הסקיל הזה</strong><span>' + esc(s.choose) + '</span></div>' : '') +
        overlaps.map(function (o) { return '<a class="alt-row" href="#/skill/' + esc(o.id) + '"><strong>' + esc(o.title) + '</strong>' + (o.choose ? '<span>' + esc(o.choose) + '</span>' : '<span>' + esc(o.what) + '</span>') + '</a>'; }).join('') + '</section>' : '') +
      (pairs.length ? '<section class="box sm"><h2>משתלב טוב עם</h2>' + pairs.map(function (o) {
        return '<a class="link-row" href="#/skill/' + esc(o.id) + '"><span>' + esc(o.title) + '</span>' + ICON.fwd + '</a>'; }).join('') + '</section>' : '') +
      '</aside></div></div>';
  }
  function installBox(s) {
    return '<section class="installbox in" id="installbox"><strong>איך מתקינים</strong>' +
      '<span style="font-size:16px">ההתקנה נעשית ישירות מהמקור של היוצר. SkillForYou לא מארח את הסקיל ולא בודק את הקוד שלו.</span>' +
      (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">למקור של הסקיל ↗</a>' : '') +
      (s.cmd ? '<span style="font-size:13px;color:#D0D0D0">למתקדמים: פקודת התקנה בטרמינל</span><code dir="ltr">' + esc(s.cmd) + '</code>' : '') +
      (s.cmdNote ? '<span style="font-size:14px;color:#E6E6E6">' + esc(s.cmdNote) + '</span>' : '') + '</section>';
  }

  /* ---------- set builder ---------- */
  function fit(s, tool) {
    if (!tool) return 1;
    if (!s.works || !s.works.length) return 0.5;
    return s.works.some(function (w) { return w === tool || w === tool + ' (Cowork)'; }) ? 1 : 0;
  }
  function buildResults() {
    var text = (st.bq || '').trim();
    if (!text || !engine) return '';
    var r = engine.cover(text, { tool: st.tool });
    var P = window.SFPlan, pl = P ? P.plan(S, text, { tool: st.tool, engine: engine }) : { picks: [], parsed: { inputs: [], outputs: [] } };
    var FL = P ? P.FLABEL : {}, taken = {}, items = [];
    pl.picks.forEach(function (p) {
      taken[p.s.id] = 1; if (p.s.ov) taken['ov:' + p.s.ov] = 1;
      var lab = []; if (p.need.in) lab.push('לקרוא ' + FL[p.need.in]); if (p.need.out) lab.push('ליצור ' + FL[p.need.out]);
      items.push({ s: p.s, label: lab.join(' ו'), reason: p.reason, warn: p.warn, alts: p.alts });
    });
    r.picks.forEach(function (p) {
      if (taken[p.s.id] || (p.s.ov && taken['ov:' + p.s.ov])) return;
      taken[p.s.id] = 1; if (p.s.ov) taken['ov:' + p.s.ov] = 1;
      items.push({ s: p.s, label: p.words.join(', '), reason: '', warn: P ? P.warnings(p.s, st.tool) : [], alts: [] });
    });
    st.lastN = items.length;
    if (!items.length) return '<section class="box in" style="font-size:16px">עוד לא הבנתי מה צריך. נסו לתאר משימות, למשל ״לבנות מצגות ללקוחות״ או ״לענות מהר למיילים״.</section>' + askAI(text, st.tool);
    var h = '<section style="display:flex;flex-direction:column;gap:22px">';
    var pin = (pl.parsed.inputs.length ? pl.parsed.inputs : pl.parsed.neutral || []).filter(function (x, i, a) { return i === 0 || ['report', 'data', 'text'].indexOf(x) === -1; }), pout = pl.parsed.outputs;
    var pu = pl.parsed.used || {}; r.leftover = r.leftover.filter(function (w) { return !pu[w]; });
    if (pl.picks.length && (pin.length || pout.length)) h += '<div class="box" style="background:var(--cream);padding:18px 24px;gap:6px"><strong style="font-size:16px">המסלול שזיהינו</strong><span style="font-size:16px">' +
      (pin.length ? 'מתחילים מ: <b>' + esc(pin.map(function (x) { return FL[x]; }).join(', ')) + '</b>' : '') + (pin.length && pout.length ? ' ← ' : '') +
      (pout.length ? 'רוצים לקבל: <b>' + esc(pout.map(function (x) { return FL[x]; }).join(', ')) + '</b>' : '') +
      (pl.tool ? ' · בכלי: <b>' + esc(pl.tool) + '</b>' : '') + '</span><span class="note">בחרנו לפי מה שכתוב בתיעוד של כל סקיל: מה הוא קורא, מה הוא מייצר ומה הוא צריך.</span></div>';
    h += '<div class="understood"><span>הבנתי שאתם צריכים:</span>' + items.map(function (p) {
      return '<span class="tag" style="background:' + C[p.s.need].color + '">' + esc(p.label) + '</span>'; }).join('') + '</div>';
    h += '<div class="sec-head"><h2>הסט שלכם: ' + (items.length === 1 ? 'סקיל אחד' : items.length + ' סקילים') + '</h2></div>';
    h += '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:24px">' + items.map(function (p, i) {
      var s = p.s;
      return '<div class="card ' + TILTS[i % 4] + '" style="cursor:default;gap:12px;animation-delay:' + i * 0.06 + 's">' +
        '<span class="tag" style="align-self:flex-start;background:' + C[s.need].color + '">בשביל: ' + esc(p.label) + '</span>' +
        '<span class="t">' + esc(s.title) + '</span><span class="w">' + esc(s.what) + '</span>' +
        (p.reason ? '<span style="font-size:14px">' + esc(p.reason) + '</span>' : '') +
        '<span style="font-size:13px;font-weight:600;color:var(--muted)">' + esc(s.by) + ' · ' + esc(s.evShort) + '</span>' +
        (p.warn.length ? '<div style="padding:8px 12px;background:#FFE08A;border:2px solid var(--ink);border-radius:12px;font-size:13px;font-weight:600;display:flex;flex-direction:column;gap:4px">' +
          p.warn.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>' : '') +
        (p.alts.length ? '<span style="font-size:13px">חלופות: ' + p.alts.map(function (o) { return '<a href="#/skill/' + esc(o.id) + '" style="font-weight:700">' + esc(o.title) + '</a>'; }).join(' · ') + '</span>' : '') +
        '<a class="btn yellow" style="align-self:flex-start;margin-top:auto;min-height:40px" href="#/skill/' + esc(s.id) + '">לעמוד הסקיל</a></div>';
    }).join('') + '</div>';
    r.skipped = r.skipped.filter(function (k) { return !taken[k.s.id]; });
    if (r.skipped.length) h += '<div class="box" style="background:var(--cream);gap:10px;padding:18px 20px"><strong style="font-size:17px">גם אלה מתאימים, אבל לא הוספנו אותם</strong>' +
      '<span style="font-size:15px;color:var(--muted)">כל אחד מהם עושה כמעט אותו דבר כמו סקיל שכבר בסט. שני סקילים לאותה משימה רק מבלבלים את ה־AI.</span>' + r.skipped.map(function (k) {
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:15px"><a href="#/skill/' + esc(k.s.id) + '" style="font-weight:700">' + esc(k.s.title) + '</a><span>במקום ״' + esc(k.instead.title) + '״</span></div>';
    }).join('') + '</div>';
    if (r.leftover.length >= 2) h += '<p class="note" style="font-size:14px">מילים שלא שייכנו לאף סקיל: ' + esc(r.leftover.slice(0, 6).join(', ')) + '. אם זה צורך חשוב, נסו לנסח אותו כמשימה.</p>';
    h += '<div class="box" style="background:var(--ink);color:#fff;border-color:var(--ink)"><strong style="font-family:var(--head);font-weight:400;font-size:20px;color:var(--yellow)">איך מתקינים סט</strong><span style="font-size:16px">אחד־אחד, מהעמוד של כל סקיל. מתחילים מזה שתשתמשו בו הכי הרבה, ובודקים אותו לפני שמוסיפים את הבא.</span></div>';
    h += askAI(text, st.tool) + '</section>';
    return h;
  }
  function build() {
    var tries = ['אני מנהלת קליניקה, טובעת במיילים ורוצה לבדוק חוזים מול ספקים', 'מכין פרזנטציות מדוחות אקסל וכותב פוסטים ללינקדאין', 'מלטש ממשק React ורוצה אנימציות שמרגישות טוב'];
    return '<div class="wrap narrow page"><section class="page-head in"><h1>בנו לי סט</h1>' +
      '<p class="lead" style="max-width:720px">ספרו במילים שלכם מה אתם עושים ומה מעיק עליכם. תוך כדי ההקלדה נרכיב לכם סט קטן מהקטלוג: סקיל אחד לכל צורך, בלי כפילויות.</p></section>' +
      '<form class="box shadow" id="buildform" style="gap:18px"><label for="bq" style="font-family:var(--head);font-size:20px">מה אתם רוצים שה־AI יעשה בשבילכם?</label>' +
      '<textarea id="bq" class="big" rows="4" placeholder="למשל: יש לי עסק קטן. אני רוצה עזרה עם המיילים, לבדוק חוזים ולדעת אם יהיה כסף למשכורות">' + esc(st.bq) + '</textarea>' +
      '<div class="row-chips"><span>דוגמאות:</span>' + tries.map(function (t) {
        return '<button type="button" class="chip dashed" style="font-size:14px;text-align:right" data-act="buildtry" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
      '<div class="row-chips" role="group" aria-label="באיזה כלי AI אתם עובדים"><span style="font-size:16px;font-weight:700">באיזה כלי אתם עובדים?</span>' +
      [''].concat(TOOLS).map(function (t) {
        return '<button type="button" class="chip" data-act="tool" data-v="' + esc(t) + '" aria-pressed="' + (st.tool === t) + '">' + esc(t || 'לא משנה') + '</button>'; }).join('') + '</div>' +
      '<button type="submit" class="btn pink big" style="align-self:flex-start">תרכיבו לי סט</button></form>' +
      '<div id="results" aria-live="polite" style="display:flex;flex-direction:column;gap:22px">' + buildResults() + '</div></div>';
  }

  /* ---------- guides ---------- */
  function guides() {
    return '<div class="wrap narrow page"><section class="page-head in"><h1>מדריכים</h1><p class="lead" style="max-width:720px">מה להתקין לכל סוג עבודה. בכל מדריך 2–3 סקילים בלבד, ולמה דווקא הם.</p></section>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:26px">' + '<a class="card tilt-d" href="#/students" style="background:#C8F7C5;padding:20px;gap:12px"><span class="t" style="font-size:21px">סקילים לסטודנטים</span><span style="font-size:16px">מדעי הנתונים, הנדסה, כלכלה ופסיכולוגיה. לעבודות וללמידה.</span><span style="margin-top:auto;font-size:14px;font-weight:800">לפי תחום · לקריאה</span></a>' + '<a class="card tilt-a" href="#/claude-code" style="background:#FFE3C2;padding:20px;gap:12px"><span class="t" style="font-size:21px">פקודות שכדאי להכיר ב־Claude Code</span><span style="font-size:16px">הפקודות המובנות שעוזרות לשמור על סדר בסקילים, בזיכרון ובשיחה.</span><span style="margin-top:auto;font-size:14px;font-weight:800">12 פקודות · לקריאה</span></a>' + GUIDES.map(function (g, i) {
        return '<a class="card ' + TILTS[i % 4] + '" href="#/guide/' + g.id + '" style="background:' + g.color + ';padding:20px;gap:12px"><span class="t" style="font-size:21px">' + esc(g.title) + '</span>' +
          '<span style="font-size:16px">' + esc(g.short) + '</span><span style="margin-top:auto;font-size:14px;font-weight:800">' + g.items.length + ' סקילים · לקריאה</span></a>';
      }).join('') + '</div></div>';
  }
  function guide(id) {
    var g = GUIDES.filter(function (x) { return x.id === id; })[0];
    if (!g) return notFound();
    return '<div class="wrap page" style="max-width:1000px;gap:28px;padding-top:12px"><a class="btn back" href="#/guides">' + ICON.back + 'כל המדריכים</a>' +
      '<article class="in" style="display:flex;flex-direction:column;gap:24px"><header class="box" style="background:' + g.color + ';box-shadow:5px 5px 0 var(--ink);border-radius:20px;padding:24px">' +
      '<h1 style="font-size:var(--h1);line-height:1">' + esc(g.title) + '</h1><p style="font-size:17px;font-weight:500">' + esc(g.intro) + '</p></header>' +
      g.items.map(function (it, i) {
        var s = byKey[it[0]]; if (!s) return '';
        return '<section class="box" style="flex-direction:row;flex-wrap:wrap;align-items:center;gap:18px;padding:20px;border-radius:24px"><span class="num" style="width:50px;height:50px;background:var(--yellow)">' + (i + 1) + '</span>' +
          '<div style="flex:999 1 380px;min-width:0;display:flex;flex-direction:column;gap:6px"><h2 style="font-size:21px">' + esc(s.title) + '</h2><span style="font-size:16px">' + esc(it[1]) + '</span>' +
          '<span style="font-size:13px;font-weight:600;color:var(--muted)">' + esc(s.by) + ' · ' + esc(s.evShort) + '</span></div>' +
          '<a class="btn pink" style="flex:1 1 150px;max-width:200px" href="#/skill/' + esc(s.id) + '">לעמוד הסקיל</a></section>';
      }).join('') +
      '<section class="box" style="background:var(--red);padding:26px"><strong style="font-family:var(--head);font-weight:400;font-size:20px">מה לא צריך</strong><span style="font-size:16px;line-height:1.6">' + esc(g.skip) + '</span></section>' +
      '<a class="btn shadow" style="align-self:flex-start;min-height:44px" href="#/build">העבודה שלך שונה? <strong style="font-family:var(--head);font-weight:400">בנו סט משלכם</strong></a></article></div>';
  }




  /* ---------- Claude Code built-in commands ---------- */
  var CC = [
    ['לשמור על סדר בסקילים', [
      ['/skills', 'רשימת הסקילים שמותקנים אצלך. אפשר למיין לפי כמה מקום כל אחד תופס, ולכבות סקיל בלי למחוק אותו.', 'התקנתם שלושה סקילים לכתיבת פוסטים ולא ברור מי מהם עובד? פותחים /skills ומכבים את השניים שלא צריך.'],
      ['/skill-doctor', 'מראה כמה כל סקיל עולה בזיכרון של השיחה וכמה משתמשים בו בפועל, ומסמן סקילים שאף פעם לא הופעלו.', 'עבר חודש מאז שהתקנתם חבילת סקילים. /skill-doctor יראה שעשרה מהם אף פעם לא הופעלו, ואפשר לכבות אותם.']
    ]],
    ['כשמשהו לא עובד', [
      ['/doctor', 'בדיקה כללית של ההתקנה, ההגדרות, התוספים וקובץ ההוראות. מציעה תיקונים, ולא משנה כלום עד שתאשרו.', 'סקיל שהתקנתם לא נטען, או ש־Claude מתעלם מההוראות הקבועות שלכם.'],
      ['/rewind', 'מחזיר את הקוד ואת השיחה לנקודה מוקדמת יותר.', 'ביקשתם לשפר כותרת ו־Claude שכתב חצי מהקובץ. /rewind מחזיר למצב שלפני.']
    ]],
    ['זיכרון ושיחה', [
      ['/memory', 'פותח את קובצי ההוראות הקבועות (CLAUDE.md): מה ש־Claude זוכר עליכם ועל הפרויקט בין שיחות.', 'נמאס לכם לבקש כל פעם ״תכתוב בעברית ובלי אימוג׳ים״? כותבים את זה פעם אחת דרך /memory.'],
      ['/init', 'יוצר קובץ הוראות ראשוני לפרויקט, מתוך מה שיש בתיקייה.', 'פתחתם את Claude Code בתיקייה של פרויקט חדש ורוצים שיכיר אותו מההתחלה.'],
      ['/clear', 'מתחיל שיחה נקייה. הזיכרון של הפרויקט נשאר.', 'סיימתם לעבוד על מצגת ועוברים לנסח חוזה. /clear, כדי שהמצגת לא תבלבל אותו.'],
      ['/compact', 'מסכם את השיחה כדי לפנות מקום.', 'אחרי שעתיים של עבודה Claude שוכח החלטות מתחילת השיחה. /compact מסכם ומפנה מקום.'],
      ['/context', 'מראה מה ממלא את הזיכרון של השיחה, כולל סקילים.', 'התשובות נהיו איטיות. /context יראה אם יש סקילים או קבצים שתופסים הרבה מקום.'],
      ['/resume', 'חוזר לשיחה קודמת.', 'סגרתם את המחשב באמצע עבודה, ולמחרת רוצים להמשיך מאותה נקודה.']
    ]],
    ['מודל ומכסה', [
      ['/model', 'מחליף מודל: Opus למשימה קשה, Haiku כדי לחסוך.', 'Sonnet נתקע בבאג מסובך? עוברים ל־Opus. רק צריך לשנות שמות לקבצים? Haiku מספיק.'],
      ['/usage', 'כמה השתמשתם ומה נשאר מהמכסה.', 'לפני שמתחילים משימה של כמה שעות, בודקים שיש מספיק מכסה כדי לסיים אותה.']
    ]]
  ];
  function claudeCode() {
    return '<div class="wrap page" style="max-width:860px"><a class="btn back" href="#/guides">' + ICON.back + 'כל המדריכים</a>' +
      '<section class="page-head in"><span class="tag" style="align-self:flex-start;background:#FFE3C2" dir="ltr">Claude Code</span><h1>פקודות שכדאי להכיר</h1>' +
      '<p class="lead">אלה פקודות שכבר מובנות ב־Claude Code, לא סקילים שמתקינים. כותבים אותן בשורת הצ׳אט, מתחילות ב־/.</p></section>' +
      CC.map(function (g) {
        return '<section class="cc-group"><h2>' + esc(g[0]) + '</h2><div class="cc-list">' + g[1].map(function (c) {
          return '<div class="cc-row"><code dir="ltr">' + esc(c[0]) + '</code><div><p>' + esc(c[1]) + '</p><span><b>לדוגמה:</b> ' + esc(c[2]).replace(/\/[a-z-]+/g, '<code class="ci">$&</code>') + '</span></div></div>';
        }).join('') + '</div></section>';
      }).join('') +
      '<p class="note">חלק מהפקודות תלויות בגרסה ובמסלול, כך שאצלכם התפריט עשוי להיראות קצת אחרת. כדי לראות את כל הפקודות, כותבים / בשורת הצ׳אט.</p></div>';
  }
  /* ---------- students ---------- */
  var FIELDS = [
    ['general-study', 'לכל סטודנט', '#FFE08A', 'ללמוד, לסכם, להתכונן למבחן ולנהל מקורות.'],
    ['data-science', 'מדעי הנתונים', '#9BE38A', 'ניתוח נתונים, מודלים, גרפים וכתיבת מאמר.'],
    ['engineering', 'הנדסה', '#7CD8FF', 'MATLAB, סימולציות, מתמטיקה סימבולית ויחידות מידה.'],
    ['economics', 'כלכלה', '#FFC2D1', 'אקונומטריקה ב־Stata וב־R, ניתוח נתונים ומודל DCF.'],
    ['psychology', 'פסיכולוגיה', '#D7B8FF', 'סטטיסטיקה, תכנון ניסוי, עוצמה סטטיסטית ודיווח לפי APA.']
  ];
  function students() {
    return '<div class="wrap page" style="max-width:1160px"><section class="page-head in"><h1>סקילים לסטודנטים</h1>' +
      '<p class="lead" style="max-width:780px">גם לעבודות ולפרויקטים שצריך להגיש, וגם ללמידה עצמה. בחרו את התחום שלכם, וקחו רק את מה שמתאים לקורס שאתם בו עכשיו.</p>' +
      '<div class="row-chips">' + FIELDS.map(function (f) { return '<a class="chip" style="display:inline-flex;align-items:center;text-decoration:none;background:' + f[2] + '" href="#/students/' + f[0] + '">' + f[1] + '</a>'; }).join('') + '</div></section>' +
      '<section class="box" style="background:var(--ink);color:#fff;border-color:var(--ink)"><strong style="font-family:var(--head);font-weight:400;font-size:20px;color:var(--yellow)">ללמוד, לא להעתיק</strong>' +
      '<span style="font-size:16px">הסקילים כאן עוזרים להבין, לתרגל ולעבוד נכון עם נתונים ומקורות. הם לא כותבים את העבודה במקומכם. ובדקו תמיד מה המדיניות בקורס לגבי שימוש ב־AI.</span></section>' +
      FIELDS.map(function (f) {
        var list = S.filter(function (s) { return (s.fields || []).indexOf(f[0]) !== -1; });
        if (!list.length) return '';
        return '<section id="' + f[0] + '" style="display:flex;flex-direction:column;gap:16px;scroll-margin-top:20px"><div class="sec-head"><h2>' + f[1] + '</h2><span style="font-size:15px;font-weight:700">' + list.length + ' סקילים</span></div>' +
          '<p style="font-size:16px">' + f[3] + '</p><div class="grid">' + list.map(card).join('') + '</div></section>';
      }).join('') +
      '<section class="box" style="background:var(--red)"><h2>מה לא מצאנו</h2><ul><li>בפסיכולוגיה אין עדיין סקיל טוב ל־SPSS או ל־jamovi, ואין סקיל ייעודי לעיצוב לפי APA. הסקילים כאן הם סקילים כלליים של שיטות מחקר.</li><li>ל־LaTeX אין עדיין סקיל ייעודי חזק. בינתיים יש תבניות לכתיבת מאמרים.</li><li>חלק מסקילי ההנדסה והכלכלה דורשים תוכנה בתשלום, כמו MATLAB ו־Stata. זה כתוב בכל עמוד.</li></ul></section></div>';
  }

  /* ---------- models ---------- */
  // speed/cost: 1 = low, 3 = high. Based on the providers' own descriptions (October 2026).
  // Verified against vendor pages and independent sources, November 2026. speed: 1–3, cost: 0 (free) – 4.
  var MODELS = [
   {
    "id": "claude",
    "name": "Claude",
    "by": "Anthropic",
    "color": "#FFB86B",
    "where": "אפליקציית Claude (אתר, מחשב וטלפון), Claude Code, API",
    "skills": "כן, באפליקציה, ב־Claude Code וב־API.",
    "pick": "מתחילים מ־Sonnet 5.5. אם הוא לא מצליח עוברים ל־Opus 5.5, ול־Fable 5.1 רק כש־Opus נתקע. זו גם ההמלצה של Anthropic למשתמשי האפליקציה. באפליקציה בוחרים את המודל ידנית.",
    "src": [
     [
      "מדריך בחירת מודל למשתמשים",
      "https://claude.com/resources/tutorials/choosing-the-right-claude-model"
     ],
     [
      "מדריך למפתחים",
      "https://platform.claude.com/docs/en/about-claude/models/choosing-a-model"
     ],
     [
      "מחירים",
      "https://claude.com/pricing"
     ],
     [
      "Fable במסלולים",
      "https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan"
     ],
     [
      "Opus 5.5",
      "https://www.anthropic.com/claude-opus-5-5"
     ],
     [
      "Sonnet 5.5",
      "https://www.anthropic.com/claude-sonnet-5-5"
     ],
     [
      "Haiku 5.5",
      "https://www.anthropic.com/claude-haiku-5-5"
     ]
    ],
    "models": [
     {
      "n": "Fable 5.1",
      "tag": "הדגל של Anthropic",
      "speed": 1,
      "cost": 4,
      "api": "$10 / $50",
      "about": "יצא בספטמבר 2026, והוא המודל הכי מסוגל ש־Anthropic פותחת לכל הלקוחות. הוא נבנה לעבודה שנמשכת שעות, למחקר בכמה שלבים ולניתוח שמסתיים במסמך, גיליון או מצגת מוגמרים. לפי Anthropic, Opus 5.5 מגיע לרמה שלו ברוב העבודה.",
      "yes": [
       "פרויקט גדול וקריטי שנמשך שעות",
       "ניתוח שצריך להסתיים בדוח, גיליון או מצגת מוגמרים",
       "בעיה ש־Opus ניסה ולא הצליח"
      ],
      "alt": [
       [
        "כמעט כל עבודה אחרת",
        "Opus 5.5",
        "ברמה דומה, מהיר יותר, וזול בערך פי 2.5"
       ],
       [
        "שאלות ומשימות יומיומיות",
        "Sonnet 5.5",
        "מהיר בהרבה ושומר על המכסה"
       ]
      ],
      "access": "לא בחשבון חינמי. בוחרים אותו ידנית בתפריט המודלים. במסלול Max ובמושבי פרימיום של Team ו־Enterprise הוא כלול, עד מחצית מהמכסה השבועית. ב־Pro משלמים עליו בקרדיטים נוספים.",
      "lim": [
       "הוא מנצל את המכסה הכי מהר.",
       "שאלות בביולוגיה, בכימיה או בסייבר התקפי מועברות אוטומטית למודל אחר, ומופיעה על זה הודעה."
      ],
      "for": "הפרויקטים הגדולים והקריטיים ביותר, כשאיכות חשובה יותר מזמן וממכסה."
     },
     {
      "n": "Opus 5.5",
      "tag": "לעבודה ארוכה ומורכבת",
      "speed": 2,
      "cost": 3,
      "api": "$4 / $20",
      "about": "יצא בספטמבר 2026, ונבנה לעבודה ארוכה שרצה כמעט לבד: פרויקטי קוד גדולים, משימות ידע עם הרבה שלבים, ועבודה במחשב ועם הרבה תמונות. לפי Anthropic הוא ברמה של Fable ברוב העבודה, בפחות ממחצית המחיר, והוא בין המובילים במדד העצמאי של Artificial Analysis.",
      "yes": [
       "משימה של שעה ומעלה עם הרבה שלבים",
       "פרויקט קוד גדול, כמו שינוי שעובר על כל המערכת",
       "כש־Sonnet ניסה ולא הצליח"
      ],
      "alt": [
       [
        "שאלה קצרה, מייל או סיכום",
        "Sonnet 5.5",
        "עונה כמעט אותו דבר, מהר יותר ובפחות מכסה"
       ],
       [
        "שליפה או סיכום פשוט",
        "Haiku 5.5",
        "מיידי וזול מאוד"
       ],
       [
        "בעיה ש־Opus נתקע בה",
        "Fable 5.1",
        "מנסים אותו רק אז"
       ]
      ],
      "access": "במסלולים בתשלום, מ־Pro ומעלה, לא בחשבון חינמי. בוחרים אותו ידנית בתפריט המודלים.",
      "lim": [
       "הוא תמיד חושב לפני שהוא עונה, ולכן איטי יותר גם בשאלות פשוטות.",
       "הוא מנצל את המכסה מהר יותר מ־Sonnet."
      ],
      "for": "משימות ארוכות עם הרבה שלבים, ופרויקטי קוד גדולים."
     },
     {
      "n": "Sonnet 5.5",
      "tag": "מתחילים ממנו",
      "speed": 3,
      "cost": 2,
      "api": "$2 / $10",
      "about": "יצא בספטמבר 2026, והוא המודל ש־Anthropic ממליצה למשתמשי האפליקציה להתחיל ממנו. הוא נבנה למשימות יומיומיות מוגדרות, לתיקון באגים וליצירת מסמכים, מצגות וגיליונות מוקפדים, והוא מהיר ביותר מ־30% מהגרסה הקודמת.",
      "yes": [
       "כתיבה, סיכומים ומיילים",
       "מסמכים, מצגות וגיליונות",
       "קוד יומיומי ותיקון באגים"
      ],
      "alt": [
       [
        "עבודה פתוחה ומורכבת שדורשת שיקול דעת לאורך זמן",
        "Opus 5.5",
        ""
       ],
       [
        "הרבה משימות פשוטות שחוזרות על עצמן",
        "Haiku 5.5",
        "זול בערך פי 20"
       ]
      ],
      "access": "Sonnet זמין גם בחשבון החינמי וגם בכל המסלולים בתשלום.",
      "lim": [
       "שאלות רגישות בביולוגיה עלולות להיחסם, גם כשהן לגיטימיות."
      ],
      "for": "רוב העבודה היומיומית: כתיבה, מסמכים, מצגות, גיליונות וקוד."
     },
     {
      "n": "Haiku 5.5",
      "tag": "המהיר והזול",
      "speed": 3,
      "cost": 1,
      "api": "$0.10 / $0.50",
      "about": "יצא באוקטובר 2026. הוא נועד לכמויות גדולות של משימות פשוטות: סיכומים, מיון, שליפת פרטים ותשובות מהירות, וגם לתפקיד של עוזר קטן בתוך מערכות אוטומציה.",
      "yes": [
       "סיכום, מיון ושליפת פרטים",
       "אוטומציות שרצות הרבה פעמים ביום",
       "תשובות מיידיות"
      ],
      "alt": [
       [
        "כל דבר עם כמה שלבים או הרבה ניואנסים",
        "Sonnet 5.5",
        ""
       ],
       [
        "קוד מורכב",
        "Sonnet 5.5 או Opus 5.5",
        "זו ההמלצה של Anthropic"
       ]
      ],
      "access": "Haiku זמין בכל המסלולים, כולל החינמי.",
      "lim": [],
      "for": "הרבה משימות קטנות, מהר ובזול."
     }
    ]
   },
   {
    "id": "openai",
    "name": "ChatGPT",
    "by": "OpenAI",
    "color": "#9BE38A",
    "where": "ChatGPT (כולל אזור העבודה ChatGPT Work), Codex, API",
    "skills": "כן, ב־ChatGPT (באזורי עבודה) וב־Codex.",
    "pick": "בצ׳אט הרגיל של ChatGPT המודל נבחר אוטומטית. מודלי GPT-6 נמצאים בעיקר ב־ChatGPT Work וב־Codex: Sol לרוב העבודה המורכבת, Terra למשימות על המסך ולכתיבה, Astra כשהאיכות הכי חשובה, ו־Luna לכמויות גדולות של משימות פשוטות.",
    "src": [
     [
      "GPT-6 Astra",
      "https://openai.com/blog/gpt-6-astra"
     ],
     [
      "מדריך המודלים",
      "https://developers.openai.com/api/docs/guides/latest-model"
     ],
     [
      "מחירים",
      "https://developers.openai.com/api/docs/pricing"
     ],
     [
      "GPT-6.1 Terra",
      "https://developers.openai.com/api/docs/models/gpt-6.1-terra"
     ],
     [
      "Sol ו־Luna",
      "https://techcrunch.com/2026/09/22/openai-launches-gpt-6-sol-and-luna/"
     ]
    ],
    "models": [
     {
      "n": "GPT-6 Astra",
      "tag": "הדגל של OpenAI",
      "speed": 1,
      "cost": 4,
      "api": "$10 / $50",
      "about": "יצא ב־3 בספטמבר 2026, והוא המודל של OpenAI לחשיבה, לקוד ולעבודה המקצועית הקשים ביותר. הוא יודע גם לעבוד במחשב ובדפדפן בשבילך. ב־Codex הוא שואל שאלות הבהרה בלי לעצור את העבודה.",
      "yes": [
       "משימה שדורשת לגלוש, ללחוץ ולמלא דברים בשבילך",
       "קוד ועבודה מקצועית שבהם הכי חשוב לא לטעות"
      ],
      "alt": [
       [
        "רוב העבודה המורכבת",
        "GPT-6.1 Sol",
        "כמעט באותה רמה, בחמישית מהמחיר"
       ],
       [
        "משימות על המסך, תמונות וכתיבה",
        "GPT-6.1 Terra",
        "מהיר פי 3 ויותר"
       ]
      ],
      "access": "במסלולים בתשלום: Plus, Pro, Business ו־Enterprise. בארגונים המנהל צריך להפעיל אותו.",
      "lim": [
       "הוא מסרב למשימות סייבר מתקדמות.",
       "מערכת הבטיחות עלולה לעצור משימה באמצע."
      ],
      "for": "העבודה המקצועית הקשה ביותר, וגם עבודה במחשב ובדפדפן בשבילך."
     },
     {
      "n": "GPT-6.1 Sol",
      "tag": "לרוב העבודה המורכבת",
      "speed": 2,
      "cost": 3,
      "api": "$2 / $10",
      "about": "יצא בסוף ספטמבר 2026 והחליף את GPT-6 Sol. לפי OpenAI הוא מגיע כמעט לרמה של Astra בקוד מורכב, בעבודה במחשב ובעבודה מקצועית, במחיר נמוך בהרבה. לכן הוא מתאים לעבודה מורכבת שרוצים להריץ לעיתים קרובות.",
      "yes": [
       "קוד ועבודה מקצועית מורכבת, כל יום",
       "עבודה במחשב בשבילך"
      ],
      "alt": [
       [
        "כשהאיכות הכי חשובה",
        "GPT-6 Astra",
        ""
       ],
       [
        "משימות על המסך ותמונות",
        "GPT-6.1 Terra",
        "מהיר יותר ומנצל פחות מכסה"
       ],
       [
        "משימות פשוטות בכמויות",
        "GPT-6 Luna",
        ""
       ]
      ],
      "access": "ב־ChatGPT Work וב־Codex, במסלולים בתשלום.",
      "lim": [],
      "for": "כמעט ברמה של Astra, בחמישית מהמחיר."
     },
     {
      "n": "GPT-6.1 Terra",
      "tag": "מהיר, למסך ולכתיבה",
      "speed": 3,
      "cost": 2,
      "api": "$1 / $5",
      "about": "יצא בסוף אוקטובר 2026. OpenAI בנתה אותו להבנת תמונות וצילומי מסך, לעבודה מדויקת במחשב ובין אפליקציות, ולכתיבה ברורה וטבעית, למשל קריאת שרטוטים טכניים או התאמת תמונות של מוצרים.",
      "yes": [
       "להבין צילום מסך, תמונה או שרטוט",
       "עבודה בין כמה אפליקציות",
       "כתיבה ברורה וזורמת"
      ],
      "alt": [
       [
        "מחקר מעמיק או קוד מורכב",
        "GPT-6.1 Sol או GPT-6 Astra",
        "זו ההמלצה של OpenAI"
       ]
      ],
      "access": "ב־ChatGPT Work וב־Codex, במסלולי Plus, Pro, Enterprise ו־Edu.",
      "lim": [
       "הוא מקבל תמונות, אבל עונה רק בטקסט."
      ],
      "for": "להבין מה שעל המסך, לעבוד במחשב ולכתוב טבעי, מהר."
     },
     {
      "n": "GPT-6 Luna",
      "tag": "המהיר והזול",
      "speed": 3,
      "cost": 1,
      "api": "$0.10 / $0.50",
      "about": "יצא בספטמבר 2026. הוא נועד למשימות ממוקדות בכמויות גדולות, כמו סיכומים, שליפת מידע ותשובות מהירות. במדד העצמאי של Artificial Analysis הוא רחוק מאחורי Sol ו־Terra, ולכן מתאים רק למשימות פשוטות.",
      "yes": [
       "סיכומים ושליפת מידע",
       "אוטומציות בכמויות גדולות"
      ],
      "alt": [
       [
        "כל משימה מורכבת",
        "GPT-6.1 Sol",
        ""
       ],
       [
        "משימות על המסך ותמונות",
        "GPT-6.1 Terra",
        ""
       ]
      ],
      "access": "במסלולים בתשלום, ב־ChatGPT Work וב־Codex. בחשבון חינמי אפשר לנסות אותו באפליקציה למחשב.",
      "lim": [
       "בצ׳אט הרגיל של ChatGPT עובד כרגע, לפי דיווחים, מודל אחר: GPT-5.6 Luna."
      ],
      "for": "הרבה משימות קטנות וברורות, במחיר נמוך מאוד."
     }
    ]
   },
   {
    "id": "gemini",
    "name": "Gemini",
    "by": "Google",
    "color": "#7CD8FF",
    "where": "אפליקציית Gemini, חיפוש Google, Gemini CLI, API",
    "skills": "כן. באפליקציה הסקילים מחליפים את ה־Gems, ואפשר לייבא קובצי SKILL.md. גם ב־Gemini CLI. ה־Gems יוסרו בדצמבר 2026.",
    "pick": "בחשבון החינמי יש רק את Flash-Lite. במסלולי AI Pro ו־Ultra בוחרים בתפריט: 3.8 Flash לרוב העבודה, ו־Argon לעבודה הקשה ביותר. Gemma הוא מודל פתוח שרץ אצלך.",
    "src": [
     [
      "Gemini 4 Argon",
      "https://ai.google.dev/gemini-api/docs/models/gemini-4-argon"
     ],
     [
      "Gemini 3.8 Flash",
      "https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash"
     ],
     [
      "מחירים",
      "https://ai.google.dev/gemini-api/docs/pricing"
     ],
     [
      "Gemma 4",
      "https://ai.google.dev/gemma/docs/core"
     ],
     [
      "סקילים ב־Gemini",
      "https://support.google.com/gemini/answer/18560919"
     ]
    ],
    "models": [
     {
      "n": "Gemini 4 Argon",
      "tag": "הדגל של Google",
      "speed": 1,
      "cost": 3,
      "api": "$2 / $10, ומדצמבר $4 / $20",
      "about": "המודל המוביל של Google, שנפתח למנויים ב־13 באוקטובר 2026. הוא מבין טקסט, תמונות, קול, וידאו ו־PDF, וקורא מסמכים ארוכים מאוד. Google מכוונת אותו להנדסת תוכנה, משפט, פיננסים וסייבר. בדירוג LMArena הוא הגיע למקום הראשון בתוצאה ראשונית.",
      "yes": [
       "מסמכים משפטיים או פיננסיים ארוכים",
       "ניתוח של וידאו, תמונות וקול",
       "קוד ומשימות עם הרבה שלבים"
      ],
      "alt": [
       [
        "רוב הקוד והעבודה היומיומית",
        "Gemini 3.8 Flash",
        "מהיר יותר ובערך בחצי מהמחיר"
       ],
       [
        "הרבה משימות פשוטות",
        "Gemini 3.5 Flash-Lite",
        ""
       ]
      ],
      "access": "במסלולי Google AI Pro ו־Ultra, בוחרים אותו בתפריט המודלים. לא בחשבון חינמי. כשנגמרת המכסה עוברים ל־Flash-Lite.",
      "lim": [
       "הוא כותב תשובות ארוכות, ולכן מנצל יותר.",
       "המחיר ב־API עולה פי 2 ב־1 בדצמבר 2026."
      ],
      "for": "העבודה הקשה ביותר: קוד, משפט, פיננסים, ומסמכים ווידאו ארוכים."
     },
     {
      "n": "Gemini 3.8 Flash",
      "tag": "לרוב העבודה",
      "speed": 2,
      "cost": 2,
      "api": "$0.75 / $3.75",
      "about": "יצא בספטמבר 2026, ו־Google ממליצה עליו לפרויקטים חדשים. הוא בנוי לקוד, לסוכנים ולתהליכי עבודה מורכבים, ואפשר לקבוע כמה הוא חושב לפני שהוא עונה.",
      "yes": [
       "עבודה יומיומית",
       "קוד וסוכנים",
       "כשרוצים איזון בין איכות למחיר"
      ],
      "alt": [
       [
        "הבעיות הקשות ביותר",
        "Gemini 4 Argon",
        ""
       ],
       [
        "משימות פשוטות בכמויות",
        "Gemini 3.5 Flash-Lite",
        ""
       ]
      ],
      "access": "במסלולי AI Pro ו־Ultra. מאז 9 באוקטובר הוא לא זמין בחשבון החינמי.",
      "lim": [
       "במשימות ארוכות הוא עלול לנצל יותר טוקנים.",
       "המחיר ב־API עולה פי 2 בינואר 2027."
      ],
      "for": "סוס העבודה: קוד, סוכנים ועבודה יומיומית, מהר ובזול."
     },
     {
      "n": "Gemini 3.5 Flash-Lite",
      "tag": "הזול והמהיר",
      "speed": 3,
      "cost": 1,
      "api": "$0.30 / $2.50",
      "about": "המודל המהיר והזול של Google, מיולי 2026. הוא נועד לפענוח מסמכים, לשליפת נתונים פשוטה ולמשימות קטנות בכמויות גדולות. זה גם המודל היחיד בחשבון החינמי של Gemini.",
      "yes": [
       "מיון, תיוג ושליפת נתונים",
       "סיכום קצר של הרבה טקסט"
      ],
      "alt": [
       [
        "כל דבר עם כמה שלבים, או כשטעות עולה ביוקר",
        "Gemini 3.8 Flash",
        ""
       ]
      ],
      "access": "זמין לכולם, כולל בחשבון החינמי. גם המנויים עוברים אליו כשנגמרת להם המכסה.",
      "lim": [
       "הוא חלש יותר בחשיבה."
      ],
      "for": "משימות פשוטות בכמויות גדולות, הכי מהר והכי זול."
     },
     {
      "n": "Gemma 4",
      "tag": "פתוח, רץ אצלך",
      "speed": 2,
      "cost": 0,
      "api": "",
      "about": "משפחת מודלים פתוחה של Google מאפריל 2026, ברישיון Apache 2.0. הגרסאות הקטנות (E2B ו־E4B) רצות על טלפון ועל מחשב נייד בלי אינטרנט. הגרסאות הגדולות (26B ו־31B) צריכות כרטיס מסך עם כ־16–18GB זיכרון.",
      "yes": [
       "פרטיות: שום מידע לא יוצא מהמכשיר",
       "עבודה בלי חיבור לאינטרנט",
       "להריץ מודל בלי לשלם על כל שימוש"
      ],
      "alt": [
       [
        "כשצריך את האיכות הגבוהה ביותר או חיפוש ברשת",
        "Gemini 3.8 Flash או Argon",
        ""
       ]
      ],
      "access": "חינם. בטלפון דרך האפליקציה Google AI Edge Gallery, ובמחשב דרך כלים כמו LM Studio או Ollama.",
      "lim": [
       "האיכות תלויה בגודל הגרסה ובחוזק המכשיר."
      ],
      "for": "מודל פתוח שרץ אצלך: בטלפון או במחשב, גם בלי אינטרנט."
     }
    ]
   },
   {
    "id": "grok",
    "name": "Grok",
    "by": "xAI",
    "color": "#E6E6E6",
    "where": "אפליקציית Grok, X, Grok Build",
    "skills": "ל־Grok Build יש תמיכה בסקילים, ולפי מקור חיצוני היא תואמת לקובצי SKILL.md. בתיעוד של xAI לא מצאנו אישור לזה.",
    "pick": "יש מודל עיקרי אחד. באתר ובאפליקציה בוחרים מצב, Expert או Fast, ולא שם של מודל.",
    "src": [
     [
      "Grok 4.7",
      "https://x.ai/news/grok-4-7"
     ],
     [
      "תיעוד Grok",
      "https://docs.x.ai/grok/overview"
     ],
     [
      "Grok Build",
      "https://docs.x.ai/build/overview"
     ]
    ],
    "models": [
     {
      "n": "Grok 4.7",
      "tag": "המודל העיקרי",
      "speed": 2,
      "cost": 2,
      "api": "$2 / $6",
      "about": "יצא ב־21 בספטמבר 2026. xAI מגדירה אותו כמודל הכי מסוגל שלה לקוד ולעבודת ידע, כמו מסמכים ומצגות. המחיר שלו ב־API נמוך בהרבה מזה של Claude Fable: חמישית על הקלט ובערך שמינית על הפלט.",
      "yes": [
       "קוד, כשהמחיר חשוב",
       "מסמכים, מצגות וגיליונות"
      ],
      "alt": [
       [
        "קוד בטרמינל וסוכנים",
        "Claude Fable 5.1 או Opus 5.5",
        "גם בגרפים של xAI עצמה Fable מוביל ברוב המבחנים"
       ]
      ],
      "access": "באתר ובאפליקציה של Grok, במצב Expert, ובמצב Fast למנויים. זמין גם ב־Cursor וב־GitHub Copilot.",
      "lim": [
       "ב־API, בקשה ארוכה מ־200 אלף טוקנים עולה כפול.",
       "המבחנים שפורסמו נערכו בידי xAI עצמה."
      ],
      "for": "קוד ועבודה משרדית, במחיר נמוך מהמודלים המובילים."
     }
    ]
   },
   {
    "id": "meta",
    "name": "Meta AI",
    "by": "Meta",
    "color": "#D7B8FF",
    "where": "WhatsApp, Instagram, Facebook, Messenger, משקפי Meta, אפליקציית Muse",
    "skills": "לא מצאנו תמיכה בסקילים.",
    "pick": "ב־WhatsApp, ב־Instagram וב־Facebook עובד Muse Spark, בלי לבחור. Muse Wonder החזק זמין כרגע בעיקר למפתחים.",
    "src": [
     [
      "Muse Spark",
      "https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/"
     ],
     [
      "Muse Wonder",
      "https://about.fb.com/news/2026/10/introducing-muse-wonder-models/"
     ]
    ],
    "models": [
     {
      "n": "Muse Wonder",
      "tag": "הדגל של Meta",
      "speed": 2,
      "cost": 3,
      "api": "$4 / $20",
      "about": "המודלים החזקים של Meta מאוקטובר 2026, שנבנו לסוכנים שעובדים לאורך זמן. הם זוכרים את ההקשר לאורך העבודה ושואלים לפני פעולה משמעותית. Meta הדגימה למשל הגשת תביעת ביטוח והבנה של מידע פיננסי. יש גם גרסה חזקה יותר, Muse Wonder Full, במנוי בתשלום.",
      "yes": [
       "משימה אישית עם כמה שלבים, כמו טפסים ובירוקרטיה"
      ],
      "alt": [
       [
        "שאלות מהירות ומשימות קטנות",
        "Muse Spark",
        ""
       ],
       [
        "עבודה במחשב ובטרמינל",
        "Claude Opus 5.5",
        ""
       ]
      ],
      "access": "כרגע בעיקר למפתחים, דרך ה־API של Meta ומנויי Muse Code (מ־5$ לחודש). לאפליקציית Muse הוא יגיע בהמשך, קודם למנויים.",
      "lim": [
       "המודל סגור, לא פתוח.",
       "מנויי Muse Code מגיל 18 בלבד."
      ],
      "for": "סוכן שמבצע בשבילך משימות ארוכות."
     },
     {
      "n": "Muse Spark",
      "tag": "העוזר שבתוך האפליקציות",
      "speed": 3,
      "cost": 1,
      "api": "",
      "about": "המודל הראשון של מעבדת העל־אינטליגנציה של Meta, מאפריל 2026. הוא מפעיל את Meta AI בכל האפליקציות של החברה ובמשקפיים, מבין מה שהמצלמה רואה, ויש לו מצב מהיר ומצב חשיבה.",
      "yes": [
       "שאלות באמצע היום, בתוך הצ׳אט",
       "להבין משהו שמצלמים",
       "קניות, בריאות ושאלות יומיומיות"
      ],
      "alt": [
       [
        "משימות ארוכות עם הרבה שלבים",
        "Muse Wonder",
        ""
       ],
       [
        "קוד",
        "Claude, GPT או Gemini",
        "Meta עצמה מודה שהוא מאחור בקוד"
       ]
      ],
      "access": "בתוך WhatsApp, Instagram, Facebook ו־Messenger. המודל נבחר אוטומטית, ואפשר לבחור בין מצב מהיר למצב חשיבה.",
      "lim": [
       "פיצ׳רים חדשים מגיעים קודם לארצות הברית."
      ],
      "for": "העוזר שבתוך WhatsApp, Instagram, Facebook ומשקפי Meta."
     }
    ]
   },
   {
    "id": "open",
    "name": "מודלים פתוחים",
    "by": "DeepSeek · Qwen · Mistral",
    "color": "#FFC2D1",
    "where": "האתרים והאפליקציות שלהם, ספקים כמו OpenRouter, או להריץ בעצמך",
    "skills": "למודל עצמו אין סקילים. משתמשים בו בתוך כלי שתומך בסקילים, כמו Codex או Cursor.",
    "pick": "מודל פתוח מתאים כשחשוב שהמידע לא ייצא החוצה, או כשמריצים הרבה משימות בתקציב קטן. למחשב רגיל מתאימים רק הקטנים: Gemma 4 (בלשונית של Gemini), או Qwen 3.8 27B עם כרטיס מסך חזק.",
    "src": [
     [
      "SkillsBench",
      "https://vals.ai/benchmarks/skillsbench"
     ],
     [
      "DeepSeek V4.1 Flash",
      "https://openrouter.ai/deepseek/deepseek-v4.1-flash"
     ],
     [
      "Qwen 3.8",
      "https://github.com/QwenLM/Qwen3.8"
     ],
     [
      "Mistral Large 4",
      "https://huggingface.co/blog/mistral-large4"
     ]
    ],
    "models": [
     {
      "n": "DeepSeek V4.1 Flash",
      "tag": "הכי משתלם עם סקילים",
      "speed": 3,
      "cost": 1,
      "api": "$0.15 / $0.60",
      "about": "הגרסה הנוכחית של DeepSeek, מספטמבר 2026 (עדכון אחרון ב־17 באוקטובר), עם משקלים פתוחים ברישיון MIT. היא בנויה לקוד, לסוכנים ולמסמכים ארוכים. במבחן הסקילים SkillsBench היא במקום הראשון, בעלות של בערך 9 סנט למשימה, ולפי DeepSeek היא עולה גם על הגרסה הגדולה שלה, V4-Pro.",
      "yes": [
       "הרבה משימות עם סקילים בתקציב קטן",
       "קוד וסוכנים"
      ],
      "alt": [
       [
        "פרטיות מלאה במחשב שלך",
        "Qwen 3.8 27B או Gemma 4",
        "רצים על מחשב עם כרטיס מסך"
       ],
       [
        "כשחשוב איפה המידע נשמר",
        "DeepSeek דרך ספק אחר, או מודל מערבי",
        ""
       ]
      ],
      "access": "באתר ובאפליקציה של DeepSeek, ב־API שלה, או דרך ספקים אחרים כמו OpenRouter. כדי להריץ אותו בעצמך צריך שרת עם כמה כרטיסי מסך.",
      "lim": [
       "האתר והאפליקציה של DeepSeek שומרים מידע בשרתים בסין.",
       "ב־API של DeepSeek המחיר כפול בשעות העומס."
      ],
      "for": "מודל פתוח, זול מאוד, ובמקום הראשון במבחן הסקילים."
     },
     {
      "n": "Qwen 3.8",
      "tag": "יש גרסה שרצה אצלך",
      "speed": 2,
      "cost": 1,
      "api": "",
      "about": "המשפחה של Alibaba מאוגוסט 2026. יש בה גרסה ענקית (Max) וגרסה בגודל 27B, ושתיהן עם משקלים פתוחים. גרסת ה־27B היא ברישיון Apache 2.0, מבינה גם תמונות ווידאו, ורצה על מחשב עם כרטיס מסך של 24GB. החברה מכוונת לקוד ולעבודה משרדית.",
      "yes": [
       "להריץ מודל טוב במחשב שלך, בלי לשלוח מידע החוצה",
       "קוד ועבודה משרדית"
      ],
      "alt": [
       [
        "מחשב נייד רגיל או טלפון",
        "Gemma 4, בגרסאות הקטנות",
        ""
       ],
       [
        "משימות עם סקילים בתקציב קטן",
        "DeepSeek V4.1 Flash",
        "חזק בהרבה במבחן הסקילים"
       ]
      ],
      "access": "בחינם באתר chat.qwen.ai, או להוריד ולהריץ, למשל ב־Ollama.",
      "lim": [
       "לגרסת ה־Max יש רישיון עם הגבלות לחברות גדולות."
      ],
      "for": "משפחה פתוחה של Alibaba, עם גרסה שרצה על מחשב חזק."
     },
     {
      "n": "Mistral Large 4",
      "tag": "אירופאי",
      "speed": 2,
      "cost": 2,
      "api": "$0.70 / $2.10",
      "about": "המודל הגדול של החברה הצרפתית Mistral. הוא יצא בתצוגה מקדימה באוקטובר 2026, והמשקלים שלו פורסמו ב־29 באוקטובר. הוא תומך ביותר מ־160 שפות, מבין תמונות ומסמכים, ומכוון במיוחד לסייבר הגנתי, לפיננסים ולמשפט.",
      "yes": [
       "ארגונים שמעדיפים ספק אירופאי",
       "עבודה בהרבה שפות",
       "ניתוח מסמכים, טבלאות וגרפים"
      ],
      "alt": [
       [
        "להריץ במחשב שלך",
        "Qwen 3.8 27B או Gemma 4",
        "Mistral Large 4 צריך שרת"
       ],
       [
        "משימות עם סקילים בתקציב קטן",
        "DeepSeek V4.1 Flash",
        ""
       ]
      ],
      "access": "דרך Mistral Studio וה־API שלה. להרצה עצמית צריך שרת חזק.",
      "lim": [
       "ב־API הוא עדיין מסומן כתצוגה מקדימה.",
       "הרישיון מגביל חברות שמוכרות אותו כשירות."
      ],
      "for": "מודל אירופאי גדול, עם משקלים פתוחים, בהרבה שפות."
     }
    ]
   }
  ]
  ;
  var LVL = ['חינם', 'נמוך', 'בינוני', 'גבוה', 'גבוה מאוד'];
  var SPD = ['', 'איטי', 'בינוני', 'מהיר'];
  function modelPanel(f) {
    var li = function (x) { return '<li>' + esc(x) + '</li>'; };
    return '<section class="mpanel" id="mpanel" role="tabpanel"><div class="mswap">' +
      '<header class="mhead"><h2>' + esc(f.name) + '</h2><span>' + esc(f.by) + '</span></header>' +
      '<dl class="mfacts"><div><dt>איפה משתמשים</dt><dd>' + esc(f.where) + '</dd></div><div><dt>סקילים</dt><dd>' + esc(f.skills) + '</dd></div></dl>' +
      (f.pick ? '<p class="mpick"><strong>בקצרה:</strong> ' + esc(f.pick) + '</p>' : '') +
      '<div class="mlist">' + f.models.map(function (m) {
        return '<details class="mdl" id="m-' + esc(m.n.replace(/\W+/g, '-')) + '"><summary><span class="mdl-top"><span class="mdl-n" dir="ltr">' + esc(m.n) + '</span><span class="mtag">' + esc(m.tag) + '</span></span>' +
          '<span class="mdl-for">' + esc(m.for) + '</span>' + ICON.chev + '</summary>' +
          '<div class="mdl-body"><p class="mdl-about">' + esc(m.about) + '</p>' +
          '<div class="mdl-cols"><div><strong>הכי מתאים ל</strong><ul class="ok">' + m.yes.map(li).join('') + '</ul></div>' +
          (m.alt && m.alt.length ? '<div><strong>מתי עדיף משהו אחר</strong><ul class="alt">' + m.alt.map(function (a) {
            return '<li><span>' + esc(a[0]) + ': עדיף <b><bdi>' + esc(a[1]) + '</bdi></b></span>' + (a[2] ? '<em>' + esc(a[2]) + '</em>' : '') + '</li>'; }).join('') + '</ul></div>' : (m.no && m.no.length ? '<div><strong>מתי עדיף משהו אחר</strong><ul class="nope">' + m.no.map(li).join('') + '</ul></div>' : '')) + '</div>' +
          (m.access ? '<p class="mdl-acc"><strong>איך משתמשים בו:</strong> ' + esc(m.access) + '</p>' : '') +
          (m.lim && m.lim.length ? '<p class="mdl-lim"><strong>שימו לב:</strong> ' + m.lim.map(esc).join(' ') + '</p>' : '') +
          '<p class="mdl-meta">מהירות: ' + SPD[m.speed] + ' · מחיר: ' + LVL[m.cost] + (m.api ? ' · ב־API: <span dir="auto">' + esc(m.api) + '</span>' : '') + '</p></div></details>';
      }).join('') + '</div>' +
      (f.src && f.src.length ? '<p class="note">מקורות: ' + f.src.map(function (s) { return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a>'; }).join(' · ') + '</p>' : '') +
      '</div></section>';
  }

  function models() {
    var f = MODELS.filter(function (m) { return m.id === st.mfam; })[0] || MODELS[0];
    return '<div class="wrap page" style="max-width:980px"><section class="page-head in"><h1>מודלים, בפשטות</h1>' +
      '<p class="lead" style="max-width:720px">בחרו משפחה, ופתחו מודל כדי לראות בשביל מה הוא בנוי, מתי עדיף משהו אחר, ואיך משתמשים בו.</p>' +
      '<span class="note" style="font-weight:600">נכון לנובמבר 2026, וזה משתנה כל חודש. מחירי API הם בדולרים למיליון טוקנים, קלט / פלט.</span></section>' +
      '<div class="mtabs" role="tablist" aria-label="משפחות מודלים">' + MODELS.map(function (m) {
        return '<button type="button" role="tab" class="mtab" data-act="mfam" data-v="' + m.id + '" aria-selected="' + (m.id === f.id) + '"><span class="mdot" style="background:' + m.color + '"></span>' + esc(m.name) + '</button>'; }).join('') + '</div>' +
      modelPanel(f) +
      '<section class="less"><h2>ואיך זה קשור לסקילים?</h2><div class="cols">' +
      '<div><strong>האפליקציה טוענת, המודל קורא</strong><span style="font-size:16px">סקיל הוא הוראות כתובות. האפליקציה (Claude, ChatGPT, Cursor) טוענת אותו, והמודל קורא ומבצע. לכן קודם בודקים שהאפליקציה תומכת בסקילים.</span></div>' +
      '<div><strong>סקיל טוב שווה הרבה</strong><span style="font-size:16px">במבחן SkillsBench, סקילים העלו את ההצלחה בכ־14.5 נקודות בממוצע. במחקר, מודל קטן עם סקילים עקף מודל גדול בלי סקילים.</span></div>' +
      '<div style="background:var(--pink)"><strong>אבל לא קסם</strong><span style="font-size:16px">בחלק מהמשימות סקילים הזיקו. 2–3 סקילים קצרים וממוקדים עובדים טוב יותר מהרבה סקילים ארוכים.</span></div></div>' +
      '<p class="note" style="color:#ddd">מקורות: <a style="color:var(--yellow)" href="https://vals.ai/benchmarks/skillsbench" target="_blank" rel="noopener">Vals AI, SkillsBench</a> (עודכן 27.09.2026) · <a style="color:var(--yellow)" href="https://arxiv.org/html/2602.12670v1" target="_blank" rel="noopener">המאמר של SkillsBench</a> · <a style="color:var(--yellow)" href="https://evaluatingevals.substack.com/p/skillsbench-review" target="_blank" rel="noopener">ביקורת עצמאית על המבחן</a></p></section></div>';
  }

  /* ---------- updates & legal ---------- */
  function updates() {
    return '<div class="wrap page" style="max-width:1000px"><section class="page-head in"><h1>מה חדש בעולם הסקילים</h1><p class="lead">מה נמדד, ממה להיזהר, ואיך להשתמש בסקילים נכון.</p><span class="dark-tag" style="align-self:flex-start;padding:5px 14px;font-size:14px">אוקטובר 2026</span></section>' +
      '<article class="box shadow"><h2>מה נמדד</h2><p style="font-size:16px;line-height:1.7">בטבלת הדירוג של SkillsBench, 34 מודלים נבדקו על אותן משימות, פעם בלי סקילים ופעם איתם. בממוצע, שיעור ההצלחה עלה מ־36% ל־51%.</p><p style="font-size:16px;line-height:1.7">שימו לב: המדידה היא על משימות, לא על סקיל מסוים.</p><span class="note" style="font-weight:600">מקור: Vals AI, טבלת SkillsBench · עודכן 27.09.2026</span></article>' +
      '<article class="box" style="background:var(--red)"><h2>מתי לבדוק פעמיים לפני התקנה</h2><ul><li>יש שני סקילים עם אותו שם, ממפרסמים שונים.</li><li>הרבה התקנות, אבל כמעט אין פעילות בריפו.</li><li>הסקיל מבקש גישה רחבה בלי סיבה ברורה.</li></ul><p style="font-size:16px;line-height:1.7">במקרה כזה, העדיפו את המקור המקורי ובדקו מי המפרסם.</p></article>' +
      '<article class="box shadow"><h2>למה לא להוריד חבילה שלמה</h2><p style="font-size:16px;line-height:1.7">חבילות גדולות כוללות הרבה סקילים חופפים. כשיש כמה סקילים לאותה משימה, ה־AI עלול לבחור את הלא נכון, וכל סקיל מותקן תופס מקום גם כשלא משתמשים בו.</p><p style="font-size:16px;line-height:1.7">העיקרון פשוט: מתקינים רק את מה שמתאים לעבודה שלך, ומוסיפים עוד כשיש צורך.</p></article>' +
      '<article class="box" style="background:var(--blue)"><h2>טיפ</h2><p style="font-size:16px;line-height:1.7">רוב הטוקנים הולכים על מה שה־AI קורא, לא על מה שהוא כותב. סקיל שמסנן את מה שנכנס לשיחה חוסך בדרך כלל יותר מסקיל שמקצר תשובות.</p></article></div>';
  }
  function legal() {
    return '<div class="wrap page" style="max-width:1000px;gap:28px"><section class="page-head in"><h1>מידע משפטי</h1></section>' +
      '<article id="terms" class="box shadow"><h2>תנאי שימוש</h2><ul style="font-size:16px"><li><strong>מה האתר הוא.</strong> SkillForYou הוא מדריך מידע עצמאי על סקילים (קובצי SKILL.md) לכלי AI. האתר לא מפתח, לא מארח, לא מוכר ולא בודק את הקוד של הסקילים שמופיעים בו.</li><li><strong>התקנה על אחריות המשתמש.</strong> כל סקיל מותקן ישירות מהמקור של היוצר שלו, ובאחריות המשתמש בלבד. סקיל יכול להריץ קוד, לגשת לקבצים או להתחבר לשירותים חיצוניים. לפני התקנה כדאי לקרוא את המקור ולבדוק מה הוא עושה.</li><li><strong>המידע ניתן כמו שהוא.</strong> המידע באתר נאסף ממקורות ציבוריים (התיעוד של כל סקיל, GitHub, skills.sh ומאגרי נתונים פתוחים), מתעדכן אוטומטית ועלול להיות חלקי, לא מדויק או לא עדכני. אין התחייבות שהמידע נכון, שסקיל מסוים יעבוד, או שהוא בטוח לשימוש.</li><li><strong>הגבלת אחריות.</strong> ככל שהחוק מאפשר, מפעיל האתר לא יהיה אחראי לנזק ישיר או עקיף שנגרם משימוש באתר, מהסתמכות על המידע בו, או מהתקנה ושימוש בסקיל כלשהו, כולל אובדן מידע, פגיעה במחשב או חשיפת מידע.</li><li><strong>לא ייעוץ מקצועי.</strong> אין באתר ייעוץ משפטי, פיננסי, רפואי או מקצועי אחר, גם כשמוצגים בו סקילים בתחומים האלה.</li><li><strong>המלצות ודירוגים.</strong> סימונים כמו ״בשימוש נרחב״, ״מפרסם רשמי״ או ״מומלץ״, וכן הסטים שהאתר מרכיב, מבוססים על נתונים ציבוריים ועל כללים קבועים, ולא על בדיקה מעשית של הסקיל. הם לא מהווים אישור או התחייבות לאיכות.</li><li><strong>קניין רוחני וסימני מסחר.</strong> הסקילים שייכים ליוצרים שלהם ומפורסמים ברישיונות שלהם. האתר מציג תיאור קצר וקישור למקור. שמות מוצרים וחברות שייכים לבעליהם, והאתר אינו קשור אליהם ואינו מטעמם.</li><li><strong>הסרה ותיקון.</strong> יוצר שרוצה להסיר סקיל מהאתר או לתקן מידע עליו יכול לפנות דרך <a href="#/legal/report">טופס הדיווח</a> או במייל <a href="mailto:nmr17135@gmail.com" dir="ltr">nmr17135@gmail.com</a>. נטפל בפנייה תוך זמן סביר.</li><li><strong>מקורות נתונים.</strong> נתוני הפופולריות מגיעים מ־skills.sh ומ־GitHub, וגם ממאגר <a href="https://github.com/LinklyAI/best-skills" target="_blank" rel="noopener">LinklyAI/best-skills</a>, ברישיון <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. לסוכני AI יש גרסה קריאה של הקטלוג בקובץ <a href="llms.txt" dir="ltr">llms.txt</a>.</li><li><strong>קישורים חיצוניים.</strong> האתר מקשר לאתרים ושירותים של אחרים (GitHub, Claude, ChatGPT ועוד). אין לנו שליטה עליהם, והשימוש בהם כפוף לתנאים שלהם.</li><li><strong>שינויים.</strong> התנאים עשויים להתעדכן מעת לעת. הגרסה שמופיעה כאן היא הגרסה התקפה.</li><li><strong>דין ושיפוט.</strong> על התנאים חל הדין הישראלי, וסמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים בישראל.</li><li><strong>יצירת קשר:</strong> <a href="mailto:nmr17135@gmail.com" dir="ltr">nmr17135@gmail.com</a>.</li></ul><span class="note" style="font-weight:600">עודכן: אוקטובר 2026</span></article>' +
      '<article id="privacy" class="box"><h2>מדיניות פרטיות</h2><ul style="font-size:16px"><li><strong>מי אנחנו.</strong> האתר מופעל באופן פרטי. לכל שאלה על המידע שלך: <a href="mailto:nmr17135@gmail.com" dir="ltr">nmr17135@gmail.com</a>.</li><li><strong>אין הרשמה ואין עוגיות.</strong> אין באתר חשבונות, רשימת תפוצה או עוגיות, והאתר לא שומר מידע בדפדפן שלך.</li><li><strong>סטטיסטיקה:</strong> האתר משתמש ב־Cloudflare Web Analytics כדי לספור כניסות לעמודים. הכלי לא משתמש בעוגיות ולא עוקב אחרי גולשים בין אתרים. נשמרים רק נתונים מצטברים, כמו מספר כניסות, עמוד, מדינה, סוג מכשיר ודפדפן.</li><li><strong>אחסון:</strong> האתר מתארח ב־Cloudflare Pages. כמו בכל אתר, השרת מקבל את כתובת ה־IP שלך כדי להעביר אליך את העמוד, ו־Cloudflare עשויה לשמור אותה לזמן קצר לצורכי אבטחה ותפעול.</li><li><strong>טפסים:</strong> מה שנשלח בטופס בקשת סקיל או בטופס הדיווח עובר דרך השירות Formspree ומגיע אלינו במייל. נשמר רק מה שמילאת, יחד עם העמוד שממנו שלחת. מסירת המידע היא מרצונך, וכתובת מייל היא רשות. המידע משמש רק כדי לטפל בפנייה ולחזור אליך, ונשמר רק כל עוד צריך לשם כך.</li><li><strong>מה מחפשים באתר:</strong> כדי לשפר את האתר ולהוסיף סקילים שחסרים, אנחנו שומרים באופן אנונימי מה מקלידים בחיפוש וב״בנו לי סט״, כמה תוצאות נמצאו, איזה סקיל נפתח אחרי החיפוש, ומאיזו מדינה הגיעה הבקשה. לא נשמרים כתובת IP, עוגיות או מזהה כלשהו, ולכן אי אפשר לקשר חיפוש לאדם. מספרי טלפון וכתובות מייל שמוקלדים בטעות נמחקים לפני השמירה. בכל זאת, כדאי לא להקליד בחיפוש פרטים אישיים. המידע נשמר במסד נתונים של Cloudflare ומשמש רק לניתוח מצטבר.</li><li><strong>שאלה ל־AI:</strong> כפתורי ״לשאול את Claude״ ו״לשאול את ChatGPT״ פותחים את האתרים האלה עם הטקסט שכתבת, ומשם חלה מדיניות הפרטיות שלהם.</li><li><strong>העברה לחו״ל.</strong> Cloudflare ו־Formspree הן חברות שהשרתים שלהן נמצאים בין היתר בארצות הברית, ולכן המידע שמתואר כאן עשוי להיות מעובד מחוץ לישראל.</li><li><strong>שיתוף.</strong> לא מוכרים מידע ולא משתפים אותו עם אף אחד מעבר לשירותים שלמעלה, אלא אם החוק מחייב זאת.</li><li><strong>הזכויות שלך.</strong> לפי חוק הגנת הפרטיות, התשמ״א־1981, אפשר לבקש לעיין במידע שנשלח עליך, לתקן אותו או למחוק אותו. פונים במייל <a href="mailto:nmr17135@gmail.com" dir="ltr">nmr17135@gmail.com</a> או דרך <a href="#/legal/report">טופס הדיווח</a>.</li><li><strong>שינויים.</strong> המדיניות עשויה להתעדכן, והגרסה שמופיעה כאן היא התקפה.</li></ul><span class="note" style="font-weight:600">עודכן: אוקטובר 2026</span></article>' +
      '<article id="a11y" class="box"><h2>הצהרת נגישות</h2><p style="font-size:16px;line-height:1.7">אנחנו רוצים שכל אחד יוכל להשתמש באתר, ופועלים להנגיש אותו לפי תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג־2013, ולפי התקן הישראלי 5568, שמבוסס על הנחיות WCAG 2.0 ברמה AA.</p><ul style="font-size:16px"><li>אפשר לנווט בכל האתר עם המקלדת, ויש קישור ״דלג לתוכן״ בתחילת כל עמוד.</li><li>מיקוד המקלדת מסומן במסגרת בולטת.</li><li>הטקסט עומד ביחסי ניגודיות מומלצים, וגודל הטקסט ניתן להגדלה בדפדפן בלי לשבור את העמוד.</li><li>מי שהגדיר במכשיר הפחתת תנועה מקבל את האתר בלי הנפשות.</li><li>האתר מותאם למסכים בכל גודל, כולל טלפון.</li><li>לכפתורים ולשדות יש תוויות שקוראי מסך יכולים להקריא.</li></ul><p style="font-size:16px;line-height:1.7"><strong>מגבלות ידועות:</strong> האתר מקשר לאתרים חיצוניים, כמו GitHub ואתרי היוצרים של הסקילים, שאינם בשליטתנו ושרמת הנגישות שלהם עשויה להיות שונה. ייתכן שחלקים באתר עדיין לא נגישים במלואם, ונשמח לשמוע עליהם.</p><p style="font-size:16px;line-height:1.7"><strong>נתקלת בבעיית נגישות?</strong> אפשר לפנות לרכז הנגישות, נועם אופיר, בטלפון <a href="tel:+972547338440" dir="ltr">054-7338440</a> או במייל <a href="mailto:nmr17135@gmail.com" dir="ltr">nmr17135@gmail.com</a>. כדאי לציין באיזה עמוד הייתה הבעיה ומה ניסית לעשות, ונחזור אליך בהקדם.</p><span class="note" style="font-weight:600">ההצהרה עודכנה ב־30 באוקטובר 2026, אחרי בדיקה עצמית של האתר.</span></article>' +
      '<article id="report" class="box" style="background:var(--green)"><h2>דיווח או בקשת עדכון</h2><p style="font-size:16px">יש טעות במידע על סקיל? אתה היוצר ורוצה לעדכן או להסיר אותו? ספר לנו, ונבדוק.</p>' +
      '<form class="req" data-type="report" style="display:flex;flex-direction:column;gap:14px"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden"><label class="field">על איזה סקיל מדובר<input name="skill" type="text" placeholder="שם הסקיל או קישור"></label>' +
      '<fieldset style="margin:0;padding:0;border:0;display:flex;flex-wrap:wrap;gap:10px"><legend style="padding:0;margin-bottom:8px;font-size:15px;font-weight:700">מה תרצה</legend>' +
      ['לתקן מידע', 'אני היוצר, רוצה להסיר', 'בעיית אבטחה'].map(function (k) {
        return '<label style="display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;background:#fff;border:2px solid var(--ink);border-radius:999px;font-size:15px;cursor:pointer"><input type="radio" name="kind" value="' + k + '" style="width:18px;height:18px;margin:0;accent-color:#141414">' + k + '</label>'; }).join('') + '</fieldset>' +
      '<label class="field">פרטים<textarea name="details" rows="4"></textarea></label><label class="field">מייל לחזרה (רשות)<input name="email" type="email" dir="ltr" placeholder="your@email.com" style="text-align:right"></label>' +
      '<button type="submit" class="btn pink head shadow" style="align-self:flex-start">שליחה</button></form></article></div>';
  }
  function notFound() {
    return '<div class="wrap page"><section class="box shadow in" style="align-items:flex-start"><h1 style="font-size:var(--h1)">לא מצאנו את העמוד הזה</h1><a class="btn yellow" href="#/">לקטלוג</a></section></div>';
  }

  /* ---------- router ---------- */
  var NAV = [['/build', 'בנו לי סט'], ['/guides', 'מדריכים'], ['/models', 'מודלים'], ['/updates', 'עדכונים']];
  function route(keepScroll) {
    var path = (location.hash || '#/').slice(1) || '/';
    var parts = path.split('/').filter(Boolean);
    var html, title = 'SkillForYou · מדריך פשוט לסקילים של AI', active = '/';
    if (!parts.length) html = home();
    else if (parts[0] === 'skill') {
      var s = byId[decodeURIComponent(parts[1] || '')];
      if (s && keepScroll !== true) logOpen(s.id);
      if (s && !s._loaded) {
        html = '<div class="wrap page"><p class="note" style="font-size:16px">טוען…</p></div>';
        fetch('data/d/' + encodeURIComponent(s.id) + '.json?v=' + (window.SF_V || '')).then(function (r) { return r.ok ? r.json() : {}; }, function () { return {}; })
          .then(function (d) { ['nots', 'does', 'how', 'examples', 'good', 'bad', 'pairs'].forEach(function (k) { if (typeof d[k] === 'string') d[k] = [d[k]]; }); Object.assign(s, d); s._loaded = true; if ((location.hash || '').indexOf('#/skill/' + s.id) === 0) route(true); });
      } else html = skillPage(s);
      if (s) title = s.title + ' · SkillForYou';
    }
    else if (parts[0] === 'build') { html = build(); active = '/build'; title = 'בנו לי סט · SkillForYou'; }
    else if (parts[0] === 'guides') { html = guides(); active = '/guides'; title = 'מדריכים · SkillForYou'; }
    else if (parts[0] === 'guide') { html = guide(parts[1]); active = '/guides'; title = 'מדריך · SkillForYou'; }
    else if (parts[0] === 'claude-code') { html = claudeCode(); active = '/guides'; title = 'פקודות ב־Claude Code · SkillForYou'; }
    else if (parts[0] === 'students') { html = students(); active = '/guides'; title = 'סקילים לסטודנטים · SkillForYou'; }
    else if (parts[0] === 'models') { html = models(); active = '/models'; title = 'מודלים · SkillForYou'; }
    else if (parts[0] === 'updates') { html = updates(); active = '/updates'; title = 'עדכונים · SkillForYou'; }
    else if (parts[0] === 'legal') { html = legal(); active = ''; title = 'מידע משפטי · SkillForYou'; }
    else html = notFound();
    closeMenu(); st.sheet = false; document.body.classList.remove('lock');
    $('#nav').innerHTML = NAV.map(function (n) {
      return '<a class="pill" href="#' + n[0] + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    $('#main').innerHTML = html;
    document.title = title;
    if (keepScroll !== true) {
      if ((parts[0] === 'legal' || parts[0] === 'students') && parts[1]) {
        setTimeout(function () { var el = document.getElementById(parts[1]); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
      } else window.scrollTo(0, 0);
    }
  }
  function closeMenu() { var n = $('#nav'), b = $('#menubtn'); if (n) n.classList.remove('open'); if (b) b.setAttribute('aria-expanded', 'false'); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#menubtn');
    if (b) { var open = !$('#nav').classList.contains('open'); $('#nav').classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); return; }
    if (!e.target.closest('.top')) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenu();
    if (st.sheet) { st.sheet = false; document.body.classList.remove('lock'); refreshCatalog(); }
  });
  function rerender() { var y = window.scrollY; route(true); window.scrollTo(0, y); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var v = b.getAttribute('data-v'), act = b.getAttribute('data-act');
    if (act === 'need') { st.need = v; st.shown = 24; if (v === 'all') { st.q = ''; var qi = $('#q'); if (qi) qi.value = ''; } refreshCatalog(); }
    else if (act === 'qclear') { var qi = $('#q'); qi.value = ''; qi.parentNode.classList.remove('has'); clearTimeout(timer); clearTimeout(ltimer); st.q = ''; st.shown = 24; refreshCatalog(); qi.focus(); }
    else if (act === 'sheet') { st.sheet = !st.sheet; st.sheetAnim = st.sheet; document.body.classList.toggle('lock', st.sheet); refreshCatalog(); }
    else if (act === 'fclear') { st.need = 'all'; st.fam = 'all'; st.sort = 'rec'; st.anyTool = false; st.shown = 24; refreshCatalog(); }
    else if (act === 'fam') { st.fam = v; st.anyTool = false; st.shown = 24; refreshCatalog(); }
    else if (act === 'sort') { st.sort = v; st.shown = 24; refreshCatalog(); }
    else if (act === 'anytool') { st.anyTool = true; refreshCatalog(); }
    else if (act === 'more') { st.shown += 48; refreshCatalog(); }
    else if (act === 'try') { st.q = v; st.need = 'all'; st.shown = 24; $('#q').value = v; refreshCatalog(); logAsk('search', v, filtered().length); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (act === 'clear') { st.q = ''; st.need = 'all'; var q = $('#q'); if (q) q.value = ''; refreshCatalog(); }
    else if (act === 'install') { st.install = !st.install; rerender(); if (st.install) { var ib = $('#installbox'); if (ib) ib.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
    else if (act === 'mfam') {
      if (st.mfam === v) return;
      st.mfam = v;
      var f = MODELS.filter(function (m) { return m.id === v; })[0];
      document.querySelectorAll('.mtab').forEach(function (t) { t.setAttribute('aria-selected', String(t.getAttribute('data-v') === v)); });
      var old = document.getElementById('mpanel');
      if (old && f) {
        var h = old.offsetHeight; old.style.minHeight = h + 'px';
        old.classList.add('out');
        setTimeout(function () {
          var tmp = document.createElement('div'); tmp.innerHTML = modelPanel(f);
          var nu = tmp.firstChild; nu.style.minHeight = h + 'px'; old.replaceWith(nu);
          requestAnimationFrame(function () { nu.style.minHeight = ''; });
        }, 140);
      }
    }
    else if (act === 'adv') { st.adv = !st.adv; rerender(); }
    else if (act === 'copy') { try { navigator.clipboard.writeText(v); } catch (x) {} b.textContent = 'הועתק'; }
    else if (act === 'tool') { st.tool = v; st.bq = $('#bq').value; rerender(); }
    else if (act === 'buildtry') { st.bq = v; rerender(); logAsk('build', v, st.lastN); var r = $('#results'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }
  });
  /* anonymous search log (no cookies, no ids): what people look for, and what they open after it */
  var logged = {}, lastAsk = null, ltimer;
  function logEvent(d) {
    if (!/pages\.dev$/.test(location.hostname)) return;
    try {
      var body = JSON.stringify(d);
      if (!(navigator.sendBeacon && navigator.sendBeacon('/api/log', new Blob([body], { type: 'text/plain' }))))
        fetch('/api/log', { method: 'POST', body: body, keepalive: true }).catch(function () {});
    } catch (x) {}
  }
  function logAsk(kind, q, n) {
    q = (q || '').trim(); if (q.length < 2) return;
    lastAsk = { kind: kind, q: q, t: Date.now() };
    var k = kind + '|' + q.toLowerCase(); if (logged[k]) return; logged[k] = 1;
    logEvent({ kind: kind, q: q, n: n, tool: kind === 'build' ? st.tool : (st.fam !== 'all' ? st.fam : '') });
  }
  function logOpen(id) {
    if (!lastAsk || Date.now() - lastAsk.t > 10 * 60 * 1000) return;
    var k = 'click|' + lastAsk.q.toLowerCase() + '|' + id; if (logged[k]) return; logged[k] = 1;
    logEvent({ kind: 'click', q: lastAsk.q, skill: id });
  }
  function refreshCatalog() {
    var c = $('#catalog'); if (!c) return;
    var f = $('#filters'), top = f ? f.scrollTop : 0;
    c.innerHTML = catalogBody(); st.sheetAnim = false;
    f = $('#filters'); if (f && top) f.scrollTop = top;
  }
  var timer, btimer;
  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') { clearTimeout(timer); var v = e.target.value; e.target.parentNode.classList.toggle('has', !!v); timer = setTimeout(function () { st.q = v; st.shown = 24; refreshCatalog(); }, 150); clearTimeout(ltimer); ltimer = setTimeout(function () { logAsk('search', v, filtered().length); }, 1500); }
    if (e.target.id === 'bq') { st.bq = e.target.value; clearTimeout(btimer); btimer = setTimeout(function () { var r = $('#results'); if (r) r.innerHTML = buildResults(); }, 280); clearTimeout(ltimer); ltimer = setTimeout(function () { logAsk('build', st.bq, st.lastN); }, 3000); }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'searchform') { document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); return; }
    if (e.target.id === 'buildform') { st.bq = $('#bq').value; var r = $('#results'); r.innerHTML = buildResults(); clearTimeout(ltimer); logAsk('build', st.bq, st.lastN); r.scrollIntoView({ behavior: 'smooth' }); return; }
    if (e.target.classList.contains('req')) { sendForm(e.target); }
  });
  /* Forms are sent to Formspree (free tier), which forwards them by email. Set the form id here. */
  var FORM_ENDPOINT = window.SF_FORM || 'https://formspree.io/f/xkjjbkaq';
  function sendForm(form) {
    var fd = new FormData(form);
    if (fd.get('_gotcha')) return;                  // spam trap filled: silently ignore
    var hasText = false; fd.forEach(function (v, k) { if (k !== '_gotcha' && String(v).trim()) hasText = true; });
    if (!hasText) { toast('נא למלא לפחות שדה אחד.'); return; }
    fd.append('page', location.hash || '#/');
    fd.append('type', form.getAttribute('data-type') || 'request');
    fd.append('_subject', form.getAttribute('data-type') === 'report' ? 'דיווח על סקיל מהאתר' : 'בקשת סקיל מהאתר');
    if (!FORM_ENDPOINT) { toast('הטופס עוד לא מחובר לשליחה. נחבר אותו בקרוב.'); return; }
    var btn = form.querySelector('[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'שולח…'; }
    fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); toast('תודה! קיבלנו, ונחזור אם השארת מייל.');
      })
      .catch(function () { toast('השליחה לא הצליחה. נסו שוב בעוד רגע.'); })
      .then(function () { if (btn) { btn.disabled = false; btn.textContent = 'שליחה'; } });
  }
  function toast(t) {
    var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3200);
  }
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#main') === 0) return;
    st.install = false; st.adv = false; route();
  });
  $('#skip').addEventListener('click', function (e) { e.preventDefault(); $('#main').focus(); });

  fetch('data/skills.json?v=' + (window.SF_V || '')).then(function (r) { return r.json(); }).then(function (d) {
    S = d.skills;
    S.forEach(function (s) {
      byId[s.id] = s; if (s.key) byKey[s.key] = s;
      if (s.ov) (byOv[s.ov] = byOv[s.ov] || []).push(s);
      s._fam = famsOf(s);
      s._text = [s.title, s.what, s.ask, s.name, s.repo, s.job, s.desc, C[s.need] && C[s.need].label].join(' ').toLowerCase().replace(/[״"׳']/g, '');
    });
    S.sort(function (a, b) { return (a.level === 'everyday' ? 0 : 1) - (b.level === 'everyday' ? 0 : 1); });
    engine = new window.SFMatch.Engine(S);
    route();
  }).catch(function () { $('#main').innerHTML = '<div class="wrap page"><p class="box">לא הצלחנו לטעון את הקטלוג. נסו לרענן.</p></div>'; });
})();
