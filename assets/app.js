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
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>',
    fwd: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>',
    shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"></path><path d="M9 12l2 2 4-4"></path></svg>'
  };
  var mark = function (d) { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; };

  var S = [], byId = {}, byKey = {}, byOv = {};
  var st = { mfam: 'claude', q: '', need: 'all', level: 'everyday', shown: 24, bq: '', built: '', tool: '', install: false, adv: false };

  /* ---------- search ---------- */
  var engine = null;
  function filtered() {
    var q = st.q.trim();
    if (q && engine) {
      return engine.search(q).map(function (r) { return S[r.idx]; }).filter(function (s) {
        return st.need === 'all' || s.need === st.need;
      });
    }
    return S.filter(function (s) { return st.need === 'all' || s.need === st.need; });
  }
  var SITE = 'https://skillforyou.pages.dev/';
  function askAI(text, tool) {
    var prompt = 'אני מחפש סקילים (SKILL.md) לכלי ה־AI שלי' + (tool ? ' (' + tool + ')' : '') + '. זה מה שאני צריך: ' + text +
      '\nתעבור על הקטלוג של SkillForYou בכתובת ' + SITE + 'llms.txt ותמליץ לי על סקיל אחד לכל צורך, בלי סקילים חופפים. לכל סקיל תסביר במשפט למה הוא מתאים ותצרף את הקישור לעמוד שלו.';
    var e = encodeURIComponent(prompt);
    return '<div class="box" style="background:var(--purple)"><strong style="font-family:var(--head);font-weight:400;font-size:24px">רוצים לנסח חופשי לגמרי?</strong>' +
      '<span style="font-size:17px">תשאלו את ה־AI שלכם. הכנו לו את השאלה, כולל הקישור לקטלוג שלנו.</span>' +
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
      '<strong style="font-family:var(--head);font-weight:400;font-size:28px">עוד אין לנו סקיל לזה.</strong>' +
      '<span style="font-size:18px">ספר לנו מה ניסית לעשות, ונחפש סקיל מתאים. ככה אנחנו יודעים מה להוסיף לקטלוג.</span>' +
      '<form class="req" data-type="request" style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:640px"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
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
    return '<div class="sec-head"><h2>' + esc(heading) + '</h2><span style="font-size:16px;font-weight:700" aria-live="polite">' + list.length + ' סקילים</span></div>' +
      '<div class="row-chips" role="group" aria-label="סינון לפי צורך">' + chips(NEEDS, 'need', st.need) + '</div>' +
      (list.length ? '<div class="grid">' + list.slice(0, st.shown).map(card).join('') + '</div>' +
        (list.length > st.shown ? '<button type="button" class="btn shadow more" data-act="more">להציג עוד (' + (list.length - st.shown) + ')</button>' : '')
        : requestBox(q) + (q ? askAI(q, '') : ''));
  }
  function home() {
    var tries = [['לחבר קבצי PDF', 'PDF'], ['מצגת', 'מצגת'], ['מיילים', 'מייל'], ['הכנה למבחן', 'הכנה למבחן'], ['רגרסיה', 'רגרסיה']];
    return '<div class="wrap page" style="gap:56px">' +
      '<section class="hero in"><h1>תן ל־AI<br>כוח־על חדש.</h1>' +
      '<p class="lead">סקיל הוא תוסף קטן שמלמד את ה־AI לעשות משהו אחד ממש טוב. כתוב מה אתה צריך, ונמצא לך את הסקיל המתאים.</p>' +
      '<form class="search" role="search" id="searchform"><label for="q" class="sr">מה אתה רוצה שה־AI יעשה?</label>' +
      '<input id="q" type="search" autocomplete="off" value="' + esc(st.q) + '" placeholder="מה אתה רוצה שה־AI ידע לעשות?">' +
      '<button type="submit" class="btn pink big">יאללה</button></form>' +
      '<div class="row-chips"><span>נסו:</span>' + tries.map(function (t) {
        return '<button type="button" class="chip dashed" data-act="try" data-v="' + esc(t[1]) + '">' + esc(t[0]) + '</button>';
      }).join('') + '</div>' +
      '<a class="btn shadow" href="#/build" style="min-height:56px;border-radius:18px"><span>צריך כמה דברים? <strong style="font-family:var(--head);font-weight:400">נרכיב לך סט בלי כפילויות</strong></span>' + ICON.fwd + '</a></section>' +
      '<section id="catalog" style="display:flex;flex-direction:column;gap:24px">' + catalogBody() + '</section>' +
      '<section class="steps3"><div style="grid-column:1/-1"><h2 style="font-size:40px">איך זה עובד</h2></div>' +
      step('#7CD8FF', 1, 'מוצאים', 'כותבים מה רוצים לעשות, או בוחרים צורך.') +
      step('#9BE38A', 2, 'מתקינים', 'מורידים את הסקיל מהמקור ומעלים אותו לאפליקציה.') +
      step('#FFB86B', 3, 'מבקשים', 'כותבים ל־AI כרגיל. הוא משתמש בסקיל לבד כשצריך.') + '</section>' +
      '<section class="less"><div style="display:flex;flex-direction:column;gap:12px;max-width:760px"><h2>פחות סקילים, יותר תוצאות</h2>' +
      '<p style="font-size:19px;line-height:1.6">באתרים אחרים מציעים להוריד חבילה שלמה של עשרות סקילים בבת אחת. זה נשמע נוח, אבל בדרך כלל זה עובד פחות טוב.</p></div>' +
      '<div class="cols"><div><strong>כפילויות מבלבלות</strong><span style="font-size:17px">בחבילות יש הרבה סקילים שעושים כמעט אותו דבר. כשיש שניים לאותה משימה, ה־AI לא תמיד יודע באיזה לבחור.</span></div>' +
      '<div><strong>כל סקיל תופס מקום</strong><span style="font-size:17px">ה־AI צריך לדעת על כל סקיל שמותקן אצלך, גם על אלה שלא תשתמש בהם אף פעם.</span></div>' +
      '<div style="background:var(--pink)"><strong>קחו רק מה שאתם צריכים</strong><span style="font-size:17px">תתחילו מהדבר שאתם עושים הכי הרבה, תתקינו סקיל אחד בשבילו, ותוסיפו עוד רק כשיש צורך.</span></div></div></section></div>';
  }
  function step(bg, n, t, d) {
    return '<div class="step" style="background:' + bg + '"><span class="num">' + n + '</span><strong>' + t + '</strong><span style="font-size:17px">' + d + '</span></div>';
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
      '<h1>' + esc(s.title) + '</h1><p style="font-size:21px;line-height:1.5;font-weight:500;max-width:700px">' + esc(s.what) + '</p>' +
      (s.why ? '<p style="font-size:18px;line-height:1.6;max-width:720px;color:#2A2A2A"><strong>למה זה עוזר: </strong>' + esc(s.why) + '</p>' : '') +
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
      (s.tryAsk ? '<section class="box" style="background:var(--blue)"><div><h2>נסו את זה</h2><span style="font-size:17px">אחרי ההתקנה, בקשו את זה ותבדקו את התוצאה. זה לוקח כמה דקות.</span></div>' +
        '<div class="try-q"><p>״' + esc(s.tryAsk) + '״</p><button type="button" data-act="copy" data-v="' + esc(s.tryAsk) + '" aria-label="העתקת הבקשה">העתקה</button></div>' +
        '<div class="two"><div><strong style="font-size:17px">ככה נראית תוצאה טובה</strong><ul>' + (s.good || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' +
        '<div><strong style="font-size:17px">סימנים שמשהו לא עובד</strong><ul>' + (s.bad || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div></div></section>' : '') +
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
      '<section class="box sm" style="background:var(--cream);padding:20px 24px"><strong style="font-size:17px">מצאת בעיה בסקיל? אתה היוצר?</strong><a class="btn" style="align-self:flex-start;min-height:46px" href="#/legal/report">לדיווח או לבקשת עדכון</a></section>' +
      '<section class="box sm" style="background:var(--purple)"><h2>מה צריך כדי שיעבוד</h2><span style="font-size:16px">' + esc(s.needs || 'עוד לא בדקנו. הפרטים נמצאים במקור של הסקיל.') + '</span></section>' +
      (overlaps.length ? '<section class="box sm" style="background:#FFF6D1"><h2>חלופות</h2><span style="font-size:16px">הסקילים האלה עושים משימה דומה. בחרו אחד, לפי מה שמתאים לכם.</span>' +
        (s.choose ? '<div class="alt-row" style="background:#fff;border-style:dashed"><strong style="font-size:15px">הסקיל הזה</strong><span>' + esc(s.choose) + '</span></div>' : '') +
        overlaps.map(function (o) { return '<a class="alt-row" href="#/skill/' + esc(o.id) + '"><strong>' + esc(o.title) + '</strong>' + (o.choose ? '<span>' + esc(o.choose) + '</span>' : '<span>' + esc(o.what) + '</span>') + '</a>'; }).join('') + '</section>' : '') +
      (pairs.length ? '<section class="box sm"><h2>משתלב טוב עם</h2>' + pairs.map(function (o) {
        return '<a class="link-row" href="#/skill/' + esc(o.id) + '"><span>' + esc(o.title) + '</span>' + ICON.fwd + '</a>'; }).join('') + '</section>' : '') +
      '</aside></div></div>';
  }
  function installBox(s) {
    return '<section class="installbox in" id="installbox"><strong>איך מתקינים</strong>' +
      '<span style="font-size:18px">ההתקנה נעשית ישירות מהמקור של היוצר. SkillForYou לא מארח את הסקיל ולא בודק את הקוד שלו.</span>' +
      (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">למקור של הסקיל ↗</a>' : '') +
      (s.cmd ? '<span style="font-size:14px;color:#D0D0D0">למתקדמים: פקודת התקנה בטרמינל</span><code dir="ltr">' + esc(s.cmd) + '</code>' : '') +
      (s.cmdNote ? '<span style="font-size:15px;color:#E6E6E6">' + esc(s.cmdNote) + '</span>' : '') + '</section>';
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
    if (!items.length) return '<section class="box in" style="font-size:18px">עוד לא הבנתי מה צריך. נסו לתאר משימות, למשל ״לבנות מצגות ללקוחות״ או ״לענות מהר למיילים״.</section>' + askAI(text, st.tool);
    var h = '<section style="display:flex;flex-direction:column;gap:22px">';
    var pin = (pl.parsed.inputs.length ? pl.parsed.inputs : pl.parsed.neutral || []).filter(function (x, i, a) { return i === 0 || ['report', 'data', 'text'].indexOf(x) === -1; }), pout = pl.parsed.outputs;
    var pu = pl.parsed.used || {}; r.leftover = r.leftover.filter(function (w) { return !pu[w]; });
    if (pl.picks.length && (pin.length || pout.length)) h += '<div class="box" style="background:var(--cream);padding:18px 24px;gap:6px"><strong style="font-size:18px">המסלול שזיהינו</strong><span style="font-size:17px">' +
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
        (p.reason ? '<span style="font-size:15px">' + esc(p.reason) + '</span>' : '') +
        '<span style="font-size:14px;font-weight:600;color:var(--muted)">' + esc(s.by) + ' · ' + esc(s.evShort) + '</span>' +
        (p.warn.length ? '<div style="padding:8px 12px;background:#FFE08A;border:2px solid var(--ink);border-radius:12px;font-size:14px;font-weight:600;display:flex;flex-direction:column;gap:4px">' +
          p.warn.map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>' : '') +
        (p.alts.length ? '<span style="font-size:14px">חלופות: ' + p.alts.map(function (o) { return '<a href="#/skill/' + esc(o.id) + '" style="font-weight:700">' + esc(o.title) + '</a>'; }).join(' · ') + '</span>' : '') +
        '<a class="btn yellow" style="align-self:flex-start;margin-top:auto;min-height:46px" href="#/skill/' + esc(s.id) + '">לעמוד הסקיל</a></div>';
    }).join('') + '</div>';
    r.skipped = r.skipped.filter(function (k) { return !taken[k.s.id]; });
    if (r.skipped.length) h += '<div class="box" style="background:var(--cream);gap:10px;padding:22px 26px"><strong style="font-size:19px">גם אלה מתאימים, אבל לא הוספנו אותם</strong>' +
      '<span style="font-size:16px;color:var(--muted)">כל אחד מהם עושה כמעט אותו דבר כמו סקיל שכבר בסט. שני סקילים לאותה משימה רק מבלבלים את ה־AI.</span>' + r.skipped.map(function (k) {
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:16px"><a href="#/skill/' + esc(k.s.id) + '" style="font-weight:700">' + esc(k.s.title) + '</a><span>במקום ״' + esc(k.instead.title) + '״</span></div>';
    }).join('') + '</div>';
    if (r.leftover.length >= 2) h += '<p class="note" style="font-size:15px">מילים שלא שייכנו לאף סקיל: ' + esc(r.leftover.slice(0, 6).join(', ')) + '. אם זה צורך חשוב, נסו לנסח אותו כמשימה.</p>';
    h += '<div class="box" style="background:var(--ink);color:#fff;border-color:var(--ink)"><strong style="font-family:var(--head);font-weight:400;font-size:26px;color:var(--yellow)">איך מתקינים סט</strong><span style="font-size:17px">אחד־אחד, מהעמוד של כל סקיל. מתחילים מזה שתשתמשו בו הכי הרבה, ובודקים אותו לפני שמוסיפים את הבא.</span></div>';
    h += askAI(text, st.tool) + '</section>';
    return h;
  }
  function build() {
    var tries = ['אני מנהלת קליניקה, טובעת במיילים ורוצה לבדוק חוזים מול ספקים', 'מכין פרזנטציות מדוחות אקסל וכותב פוסטים ללינקדאין', 'מלטש ממשק React ורוצה אנימציות שמרגישות טוב'];
    return '<div class="wrap narrow page"><section class="page-head in"><h1>בנו לי סט</h1>' +
      '<p class="lead" style="max-width:720px">ספרו במילים שלכם מה אתם עושים ומה מעיק עליכם. תוך כדי ההקלדה נרכיב לכם סט קטן מהקטלוג: סקיל אחד לכל צורך, בלי כפילויות.</p></section>' +
      '<form class="box shadow" id="buildform" style="gap:18px"><label for="bq" style="font-family:var(--head);font-size:26px">מה אתם רוצים שה־AI יעשה בשבילכם?</label>' +
      '<textarea id="bq" class="big" rows="4" placeholder="למשל: יש לי עסק קטן. אני רוצה עזרה עם המיילים, לבדוק חוזים ולדעת אם יהיה כסף למשכורות">' + esc(st.bq) + '</textarea>' +
      '<div class="row-chips"><span>דוגמאות:</span>' + tries.map(function (t) {
        return '<button type="button" class="chip dashed" style="font-size:15px;text-align:right" data-act="buildtry" data-v="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
      '<div class="row-chips" role="group" aria-label="באיזה כלי AI אתם עובדים"><span style="font-size:17px;font-weight:700">באיזה כלי אתם עובדים?</span>' +
      [''].concat(TOOLS).map(function (t) {
        return '<button type="button" class="chip" data-act="tool" data-v="' + esc(t) + '" aria-pressed="' + (st.tool === t) + '">' + esc(t || 'לא משנה') + '</button>'; }).join('') + '</div>' +
      '<button type="submit" class="btn pink big" style="align-self:flex-start">תרכיבו לי סט</button></form>' +
      '<div id="results" aria-live="polite" style="display:flex;flex-direction:column;gap:22px">' + buildResults() + '</div></div>';
  }

  /* ---------- guides ---------- */
  function guides() {
    return '<div class="wrap narrow page"><section class="page-head in"><h1>מדריכים</h1><p class="lead" style="max-width:720px">מה להתקין לכל סוג עבודה. בכל מדריך 2–3 סקילים בלבד, ולמה דווקא הם.</p></section>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:26px">' + '<a class="card tilt-d" href="#/students" style="background:#C8F7C5;padding:26px;gap:12px"><span class="t" style="font-size:28px">סקילים לסטודנטים</span><span style="font-size:17px">מדעי הנתונים, הנדסה, כלכלה ופסיכולוגיה. לעבודות וללמידה.</span><span style="margin-top:auto;font-size:15px;font-weight:800">לפי תחום · לקריאה</span></a>' + GUIDES.map(function (g, i) {
        return '<a class="card ' + TILTS[i % 4] + '" href="#/guide/' + g.id + '" style="background:' + g.color + ';padding:26px;gap:12px"><span class="t" style="font-size:28px">' + esc(g.title) + '</span>' +
          '<span style="font-size:17px">' + esc(g.short) + '</span><span style="margin-top:auto;font-size:15px;font-weight:800">' + g.items.length + ' סקילים · לקריאה</span></a>';
      }).join('') + '</div></div>';
  }
  function guide(id) {
    var g = GUIDES.filter(function (x) { return x.id === id; })[0];
    if (!g) return notFound();
    return '<div class="wrap page" style="max-width:1000px;gap:28px;padding-top:12px"><a class="btn back" href="#/guides">' + ICON.back + 'כל המדריכים</a>' +
      '<article class="in" style="display:flex;flex-direction:column;gap:24px"><header class="box" style="background:' + g.color + ';box-shadow:10px 10px 0 var(--ink);border-radius:28px;padding:34px">' +
      '<h1 style="font-size:clamp(38px,5.5vw,64px);line-height:1">' + esc(g.title) + '</h1><p style="font-size:20px;font-weight:500">' + esc(g.intro) + '</p></header>' +
      g.items.map(function (it, i) {
        var s = byKey[it[0]]; if (!s) return '';
        return '<section class="box" style="flex-direction:row;flex-wrap:wrap;align-items:center;gap:18px;padding:26px;border-radius:24px"><span class="num" style="width:50px;height:50px;background:var(--yellow)">' + (i + 1) + '</span>' +
          '<div style="flex:999 1 380px;min-width:0;display:flex;flex-direction:column;gap:6px"><h2 style="font-size:28px">' + esc(s.title) + '</h2><span style="font-size:17px">' + esc(it[1]) + '</span>' +
          '<span style="font-size:14px;font-weight:600;color:var(--muted)">' + esc(s.by) + ' · ' + esc(s.evShort) + '</span></div>' +
          '<a class="btn pink" style="flex:1 1 150px;max-width:200px" href="#/skill/' + esc(s.id) + '">לעמוד הסקיל</a></section>';
      }).join('') +
      '<section class="box" style="background:var(--red);padding:26px"><strong style="font-family:var(--head);font-weight:400;font-size:26px">מה לא צריך</strong><span style="font-size:17px;line-height:1.6">' + esc(g.skip) + '</span></section>' +
      '<a class="btn shadow" style="align-self:flex-start;min-height:56px" href="#/build">העבודה שלך שונה? <strong style="font-family:var(--head);font-weight:400">בנו סט משלכם</strong></a></article></div>';
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
      '<section class="box" style="background:var(--ink);color:#fff;border-color:var(--ink)"><strong style="font-family:var(--head);font-weight:400;font-size:26px;color:var(--yellow)">ללמוד, לא להעתיק</strong>' +
      '<span style="font-size:17px">הסקילים כאן עוזרים להבין, לתרגל ולעבוד נכון עם נתונים ומקורות. הם לא כותבים את העבודה במקומכם. ובדקו תמיד מה המדיניות בקורס לגבי שימוש ב־AI.</span></section>' +
      FIELDS.map(function (f) {
        var list = S.filter(function (s) { return (s.fields || []).indexOf(f[0]) !== -1; });
        if (!list.length) return '';
        return '<section id="' + f[0] + '" style="display:flex;flex-direction:column;gap:16px;scroll-margin-top:20px"><div class="sec-head"><h2>' + f[1] + '</h2><span style="font-size:16px;font-weight:700">' + list.length + ' סקילים</span></div>' +
          '<p style="font-size:18px">' + f[3] + '</p><div class="grid">' + list.map(card).join('') + '</div></section>';
      }).join('') +
      '<section class="box" style="background:var(--red)"><h2>מה לא מצאנו</h2><ul><li>בפסיכולוגיה אין עדיין סקיל טוב ל־SPSS או ל־jamovi, ואין סקיל ייעודי לעיצוב לפי APA. הסקילים כאן הם סקילים כלליים של שיטות מחקר.</li><li>ל־LaTeX אין עדיין סקיל ייעודי חזק. בינתיים יש תבניות לכתיבת מאמרים.</li><li>חלק מסקילי ההנדסה והכלכלה דורשים תוכנה בתשלום, כמו MATLAB ו־Stata. זה כתוב בכל עמוד.</li></ul></section></div>';
  }

  /* ---------- models ---------- */
  // speed/cost: 1 = low, 3 = high. Based on the providers' own descriptions (October 2026).
  var MODELS = [
    { id: 'claude', name: 'Claude', by: 'Anthropic', color: '#FFB86B', where: 'אפליקציית Claude, Claude Code',
      skills: 'כן, באפליקציה, ב־Claude Code וב־API.',
      src: [['מדריך בחירת מודל', 'https://platform.claude.com/docs/en/about-claude/models/choosing-a-model'], ['Fable 5.1', 'https://www.anthropic.com/claude-fable-and-mythos-5-1'], ['סקילים באפליקציה', 'https://support.claude.com/en/articles/12512176-what-are-skills'], ['Artificial Analysis', 'https://artificialanalysis.ai/leaderboards/models']],
      models: [
        { n: 'Fable 5.1', for: 'בעיות קשות במיוחד, כשאיכות חשובה יותר מזמן ומחיר.', tag: 'הדגל של Anthropic', speed: 1, cost: 3,
          about: 'המודל שהחברה מגדירה כהכי מסוגל שלה, ויצא בספטמבר 2026. הוא נועד לבעיות קשות במיוחד שדורשות חשיבה ארוכה, והוא האיטי והיקר במשפחה. במדד העצמאי של Artificial Analysis, דווקא Opus 5.5 קיבל ציון גבוה יותר.',
          yes: ['ניתוח מורכב שדורש חשיבה עמוקה', 'בעיה שמודלים אחרים לא פתרו'], no: ['שאלות יומיומיות ותשובות מהירות', 'עבודה בכמויות גדולות'],
          lim: ['חלק מהמשימות בתחומי סייבר וביולוגיה מועברות ממנו למודלי Opus.'] },
        { n: 'Opus 5.5', for: 'עבודה ארוכה שמסתיימת בתוצר מוגמר.', tag: 'נקודת התחלה מומלצת', speed: 2, cost: 2,
          about: 'יצא בספטמבר 2026, ונבנה לעבודה ארוכה שרצה כמעט לבד: פרויקטי קוד גדולים, וניתוח שמסתיים בתוצר מוגמר כמו מסמך, גיליון או מצגת. Anthropic ממליצה להתחיל ממנו ברוב המקרים, ובמדד של Artificial Analysis הוא במקום הראשון.',
          yes: ['משימות של כמה שעות עם הרבה שלבים', 'כשרוצים תוצר מוגמר ולא רק תשובה'], no: ['צ׳אט קצר ופשוט'], lim: [] },
        { n: 'Sonnet 5.5', for: 'עבודה יומיומית, חכמה ומהירה.', tag: 'האיזון הטוב', speed: 3, cost: 2,
          about: 'השילוב של מהירות ואינטליגנציה. זה המודל לעבודה היומיומית: כתיבה, סיכומים, עבודה עם קבצים וקוד, כשרוצים תשובה טובה בלי לחכות.',
          yes: ['כתיבה, סיכומים ועבודה עם קבצים', 'קוד יומיומי'], no: ['משימות ארוכות מאוד שדורשות את החשיבה העמוקה ביותר'], lim: [] },
        { n: 'Haiku 5.5', for: 'הרבה משימות קטנות, מהר ובזול.', tag: 'המהיר והזול במשפחה', speed: 3, cost: 1,
          about: 'המודל המהיר והזול של Claude. הוא נועד לכמויות גדולות של משימות קטנות ולתגובות בזמן אמת, למשל מיון, תיוג ותשובות קצרות.',
          yes: ['מיון, תיוג ותשובות קצרות', 'אוטומציות שרצות הרבה פעמים ביום'], no: ['ניתוח מורכב או כתיבה ארוכה ומדויקת'], lim: [] }
      ] },
    { id: 'openai', name: 'ChatGPT', by: 'OpenAI', color: '#9BE38A', where: 'ChatGPT, Codex',
      skills: 'כן, ב־ChatGPT (בסביבות עבודה) וב־Codex.',
      src: [['GPT-6 Astra', 'https://openai.com/index/gpt-6-astra/'], ['Sol ו־Luna', 'https://openai.com/index/introducing-gpt-6-sol-and-luna/'], ['מודלים ב־ChatGPT', 'https://help.openai.com/en/articles/20001354-gpt-6-and-other-models-in-chatgpt'], ['סקילים', 'https://openai.com/academy/skills/']],
      models: [
        { n: 'GPT-6 Astra', for: 'עבודה מקצועית קשה, ועבודה במחשב ובדפדפן בשבילך.', tag: 'הדגל של OpenAI', speed: 2, cost: 3,
          about: 'המודל החזק של OpenAI, שיצא בסוף ספטמבר 2026. החברה מדגישה עבודה במחשב ובדפדפן בשבילך, הנדסת תוכנה ועבודה מקצועית. הוא גם שואל שאלות הבהרה ממוקדות, וממשיך לעבוד בזמן שהוא מחכה לתשובה.',
          yes: ['משימות שדורשות לגלוש, ללחוץ ולמלא דברים בשבילך', 'פרויקטי קוד ועבודה מקצועית מורכבת'], no: ['שימוש יומיומי פשוט'],
          lim: ['זמין במסלולים בתשלום.', 'מסרב למשימות סייבר מתקדמות.'] },
        { n: 'GPT-6.1 Sol', for: 'קרוב ל־Astra, במחיר נמוך יותר.', tag: 'מאוזן', speed: 2, cost: 2,
          about: 'לפי OpenAI הוא מתקרב לביצועים של Astra, במחיר נמוך יותר. זה המודל לרוב העבודה היומיומית.',
          yes: ['כתיבה, ניתוח וקוד ביומיום'], no: ['המשימות הכי קשות'], lim: [] },
        { n: 'GPT-6.1 Terra', for: 'עבודה מהירה עם תמונות, מחשב וכתיבה.', tag: 'מהיר', speed: 3, cost: 2,
          about: 'מודל מהיר ויעיל, שנועד להבנת תמונות וצילומי מסך, לעבודה במחשב ולכתיבה מהירה.',
          yes: ['הבנת צילומי מסך ותמונות', 'כתיבה מהירה'], no: ['חשיבה ארוכה ומעמיקה'], lim: [] },
        { n: 'GPT-6 Luna', for: 'הרבה בקשות קטנות במחיר נמוך מאוד.', tag: 'המהיר והזול במשפחה', speed: 3, cost: 1,
          about: 'המודל המהיר והזול של OpenAI, לכמויות גדולות של בקשות קטנות. לפי החברה, כשנותנים לו לחשוב יותר הוא מגיע לרמה של GPT-5.6 Sol במחיר נמוך בהרבה.',
          yes: ['תשובות מהירות', 'אוטומציות בכמויות גדולות'], no: ['משימות מורכבות שדורשות דיוק גבוה'],
          lim: ['בחשבון חינמי של ChatGPT מקבלים כרגע את GPT-5.6 Luna.'] }
      ] },
    { id: 'gemini', name: 'Gemini', by: 'Google', color: '#7CD8FF', where: 'אפליקציית Gemini, חיפוש Google, Gemini CLI',
      skills: 'כן. באפליקציה (סקילים מחליפים את ה־Gems, ואפשר לייבא קובצי SKILL.md) וב־Gemini CLI.',
      src: [['Gemini 4 Argon', 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/'], ['כרטיסי מודלים', 'https://deepmind.google/models/model-cards/'], ['Gemma 4', 'https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/'], ['סקילים ב־Gemini', 'https://support.google.com/gemini/answer/18560919']],
      models: [
        { n: 'Gemini 4 Argon', for: 'עבודה מקצועית קשה, וגם הבנה של וידאו ארוך.', tag: 'הדגל של Google', speed: 2, cost: 3,
          about: 'המודל המוביל של Google, שנכנס לאפליקציה באוקטובר 2026. הוא מבין טקסט, תמונות, קול וגם וידאו ארוך, וקורא מסמכים ארוכים מאוד. Google מדגישה הנדסת תוכנה ועבודה עסקית, משפטית ופיננסית. בדירוג LMArena הוא במקום הראשון, לפי תוצאה ראשונית.',
          yes: ['ניתוח של וידאו, תמונות וקול', 'עבודה עסקית, משפטית ופיננסית', 'מסמכים ארוכים מאוד'], no: ['שאלות מהירות ופשוטות'],
          lim: ['זמין במסלולי Pro ו־Ultra.', 'לפי Google הוא עלול לפעמים להיות איטי.'] },
        { n: 'Gemini 3.8 Flash', for: 'סוס העבודה: קוד וסוכנים, מהר ובזול.', tag: 'מהיר וזול', speed: 3, cost: 1,
          about: '"סוס העבודה" של Google: מודל מהיר וזול לקוד ולסוכנים, שאפשר לכוון כמה הוא חושב לפני שהוא עונה.',
          yes: ['עבודה יומיומית מהירה', 'סוכנים שרצים הרבה'], no: ['המשימות הכי קשות'], lim: [] },
        { n: 'Gemini 3.5 Flash-Lite', for: 'משימות פשוטות בכמויות גדולות מאוד.', tag: 'הזול במשפחה', speed: 3, cost: 1,
          about: 'המודל הזול של Google, למשימות פשוטות בכמויות גדולות מאוד.',
          yes: ['מיון וסיכום קצר של הרבה טקסט'], no: ['כל דבר שדורש חשיבה'], lim: [] },
        { n: 'Gemma 4', for: 'מודל פתוח שרץ גם על טלפון או מחשב, בלי אינטרנט.', tag: 'פתוח, רץ אצלך', speed: 2, cost: 1,
          about: 'משפחת מודלים פתוחה של Google, שכל אחד יכול להוריד ולהריץ. הגרסאות הקטנות רצות על טלפון בלי אינטרנט, והגדולות על מחשב עם כרטיס מסך חזק.',
          yes: ['פרטיות, כשלא רוצים לשלוח מידע לענן', 'עבודה בלי חיבור'], no: ['משימות שדורשות את החוזק של מודלי הענן'], lim: [] }
      ] },
    { id: 'grok', name: 'Grok', by: 'xAI', color: '#E6E6E6', where: 'אפליקציית Grok, X, Grok Build',
      skills: 'ל־Grok Build יש "skills", אבל לא מצאנו אישור שזה אותו פורמט.',
      src: [['Grok 4.7', 'https://x.ai/news/grok-4-7']],
      models: [
        { n: 'Grok 4.7', for: 'קוד ועבודה משרדית במחיר טוב.', tag: 'המודל העיקרי', speed: 2, cost: 2,
          about: 'המודל שהחברה מגדירה כהכי מסוגל שלה לקוד ולעבודה משרדית, ויצא בספטמבר 2026. לפי החברה, המחיר שלו לטוקן הוא בערך חמישית מזה של Claude Fable, והוא עובד גם עם קובצי Excel, PowerPoint ו־Word.',
          yes: ['קוד, כשהמחיר חשוב', 'עבודה עם קובצי Office'], no: ['משימות שדורשות את המודלים המובילים'],
          lim: ['בגרפים של xAI עצמה, הוא מאחורי Claude Fable ברוב המבחנים.'] }
      ] },
    { id: 'meta', name: 'Meta AI', by: 'Meta', color: '#D7B8FF', where: 'WhatsApp, Instagram, Facebook, אפליקציית Meta AI',
      skills: 'לא מצאנו תמיכה בסקילים.',
      src: [['Muse Wonder', 'https://about.fb.com/news/2026/10/introducing-muse-wonder-models/'], ['Muse Spark', 'https://about.fb.com/news/2026/04/introducing-muse-spark-meta-superintelligence-labs/']],
      models: [
        { n: 'Muse Wonder', for: 'סוכן שמבצע משימות בשבילך בחיים האישיים.', tag: 'הדגל של Meta', speed: 2, cost: 3,
          about: 'המודלים החזקים החדשים של Meta, מאוקטובר 2026, שנבנו לסוכנים שמבצעים משימות בשבילך. הדוגמאות של Meta הן תביעת ביטוח, חוזה שכירות וסידור כספים.',
          yes: ['משימות עם כמה שלבים בחיים האישיים'], no: ['עבודה מקצועית עם קבצים וקוד'],
          lim: ['כרגע זמין בעיקר למפתחים, ובהמשך למנויים.', 'המודל סגור, לא פתוח.'] },
        { n: 'Muse Spark', for: 'העוזר המהיר שבתוך WhatsApp ו־Instagram.', tag: 'קטן ומהיר', speed: 3, cost: 1,
          about: 'המודל הקטן והמהיר שמפעיל את Meta AI בתוך WhatsApp, Instagram, Facebook ומשקפי Meta. הוא נועד לשאלות מהירות באמצע היום ולהבנה של תמונות ושל מה שהמצלמה רואה.',
          yes: ['שאלות מהירות באמצע היום', 'הבנת תמונות ומה שהמצלמה רואה'], no: ['עבודה מקצועית ארוכה'], lim: [] }
      ] },
    { id: 'open', name: 'מודלים פתוחים', by: 'DeepSeek · Qwen · Mistral', color: '#FFC2D1', where: 'האתרים והאפליקציות שלהם, או להריץ על שרת משלך',
      skills: 'למודל עצמו אין סקילים. משתמשים בו בתוך כלי שתומך בסקילים, כמו Codex או Cursor.',
      src: [['DeepSeek', 'https://api-docs.deepseek.com/news/news261017/'], ['Qwen', 'https://github.com/QwenLM/Qwen3.8'], ['Mistral Large 4', 'https://mistral.ai/news/mistral-large-4/'], ['SkillsBench', 'https://vals.ai/benchmarks/skillsbench']],
      models: [
        { n: 'DeepSeek V4-Pro', for: 'מודל פתוח וחזק לקוד, להרצה על שרת משלך.', tag: 'פתוח וחזק', speed: 2, cost: 1,
          about: 'מודל גדול מאוד עם משקלים פתוחים, שכל אחד יכול להוריד ולהריץ על השרתים שלו. החברה מגדירה אותו כמוביל בין המודלים הפתוחים בקוד ובסוכנים.',
          yes: ['ארגון שרוצה מודל חזק על השרתים שלו'], no: ['שימוש אישי על מחשב רגיל'], lim: ['הוא ענק, ולא ירוץ על מחשב ביתי.'] },
        { n: 'DeepSeek V4.1 Flash', for: 'עבודה מהירה במחיר נמוך מאוד.', tag: 'זול מאוד', speed: 3, cost: 1,
          about: 'הגרסה המהירה והזולה של DeepSeek, עם משקלים פתוחים. במבחן הסקילים SkillsBench הוא הגיע למקום הראשון, בעלות של בערך 9 סנט למשימה.',
          yes: ['הרבה משימות עם סקילים, בתקציב קטן'], no: ['כשצריך את האיכות של המודלים המובילים'], lim: ['גם הוא גדול מדי למחשב ביתי.'] },
        { n: 'Qwen 3.8', for: 'סוכנים ואוטומציה בהרבה שפות, עם גרסה מקומית.', tag: 'יש גרסה שרצה אצלך', speed: 2, cost: 1,
          about: 'המשפחה של Alibaba. הגרסה הפתוחה בגודל 27B ניתנת להרצה על מחשב עם כרטיס מסך חזק. החברה מדגישה סוכני קוד, אוטומציה משרדית ועבודה בהרבה שפות.',
          yes: ['להריץ מודל מקומי בלי לשלוח מידע החוצה'], no: ['משימות שדורשות את המודלים המובילים'], lim: ['גרסת ה־Max החזקה סגורה, לא פתוחה.'] },
        { n: 'Mistral Large 4', for: 'מודל אירופאי רב־לשוני.', tag: 'אירופאי', speed: 2, cost: 2,
          about: 'המודל הגדול של החברה הצרפתית Mistral, מאוקטובר 2026. הוא רב־לשוני, והחברה הבטיחה לפרסם את המשקלים שלו.',
          yes: ['ארגונים שמעדיפים ספק אירופאי', 'עבודה בהרבה שפות'], no: ['כשצריך מודל יציב לעבודה שוטפת'], lim: ['עדיין בגרסת תצוגה מקדימה, והמשקלים עוד לא פורסמו.'] }
      ] }
  ];
  var LVL = ['', 'נמוך', 'בינוני', 'גבוה'];
  var SPD = ['', 'איטי', 'בינוני', 'מהיר'];
  function modelPanel(f) {
    return '<section class="mpanel" id="mpanel" role="tabpanel"><div class="mswap">' +
      '<header class="mhead"><h2>' + esc(f.name) + '</h2><span>' + esc(f.by) + '</span></header>' +
      '<dl class="mfacts"><div><dt>איפה משתמשים</dt><dd>' + esc(f.where) + '</dd></div><div><dt>סקילים</dt><dd>' + esc(f.skills.replace(/^טוען סקילים: /, '')) + '</dd></div></dl>' +
      '<div class="mlist">' + f.models.map(function (m, i) {
        return '<details class="mdl"><summary><span class="mdl-top"><span class="mdl-n" dir="ltr">' + esc(m.n) + '</span><span class="mtag">' + esc(m.tag) + '</span></span>' +
          '<span class="mdl-for">' + esc(m.for) + '</span>' + ICON.chev + '</summary>' +
          '<div class="mdl-body"><p class="mdl-about">' + esc(m.about) + '</p>' +
          '<div class="mdl-cols"><div><strong>מתאים ל</strong><ul class="ok">' + m.yes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
          '<div><strong>מתי לא לבחור בו</strong><ul class="nope">' + m.no.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
          (m.lim && m.lim.length ? '<p class="mdl-lim"><strong>שימו לב:</strong> ' + m.lim.map(esc).join(' ') + '</p>' : '') +
          '<p class="mdl-meta">מהירות: ' + SPD[m.speed] + ' · מחיר: ' + LVL[m.cost] + '</p></div></details>';
      }).join('') + '</div>' +
      '</div></section>';
  }
  function models() {
    var f = MODELS.filter(function (m) { return m.id === st.mfam; })[0] || MODELS[0];
    return '<div class="wrap page" style="max-width:980px"><section class="page-head in"><h1>מודלים, בפשטות</h1>' +
      '<p class="lead" style="max-width:720px">בחרו משפחה, ופתחו מודל כדי לראות בשביל מה הוא בנוי ומתי לבחור בו.</p>' +
      '<span class="note" style="font-weight:600">נכון לאוקטובר 2026. זה משתנה כל חודש.</span></section>' +
      '<div class="mtabs" role="tablist" aria-label="משפחות מודלים">' + MODELS.map(function (m) {
        return '<button type="button" role="tab" class="mtab" data-act="mfam" data-v="' + m.id + '" aria-selected="' + (m.id === f.id) + '"><span class="mdot" style="background:' + m.color + '"></span>' + esc(m.name) + '</button>'; }).join('') + '</div>' +
      modelPanel(f) +
      '<section class="less"><h2>ואיך זה קשור לסקילים?</h2><div class="cols">' +
      '<div><strong>האפליקציה טוענת, המודל קורא</strong><span style="font-size:17px">סקיל הוא הוראות כתובות. האפליקציה (Claude, ChatGPT, Cursor) טוענת אותו, והמודל קורא ומבצע. לכן קודם בודקים שהאפליקציה תומכת בסקילים.</span></div>' +
      '<div><strong>סקיל טוב שווה הרבה</strong><span style="font-size:17px">במבחן SkillsBench, סקילים העלו את ההצלחה בכ־14.5 נקודות בממוצע. במחקר, מודל קטן עם סקילים עקף מודל גדול בלי סקילים.</span></div>' +
      '<div style="background:var(--pink)"><strong>אבל לא קסם</strong><span style="font-size:17px">בחלק מהמשימות סקילים הזיקו. 2–3 סקילים קצרים וממוקדים עובדים טוב יותר מהרבה סקילים ארוכים.</span></div></div>' +
      '<p class="note" style="color:#ddd">מקורות: <a style="color:var(--yellow)" href="https://vals.ai/benchmarks/skillsbench" target="_blank" rel="noopener">Vals AI, SkillsBench</a> (עודכן 27.09.2026) · <a style="color:var(--yellow)" href="https://arxiv.org/html/2602.12670v1" target="_blank" rel="noopener">המאמר של SkillsBench</a> · <a style="color:var(--yellow)" href="https://evaluatingevals.substack.com/p/skillsbench-review" target="_blank" rel="noopener">ביקורת עצמאית על המבחן</a></p></section></div>';
  }

  /* ---------- updates & legal ---------- */
  function updates() {
    return '<div class="wrap page" style="max-width:1000px"><section class="page-head in"><h1>מה חדש בעולם הסקילים</h1><p class="lead">מה נמדד, ממה להיזהר, ואיך להשתמש בסקילים נכון.</p><span class="dark-tag" style="align-self:flex-start;padding:5px 14px;font-size:15px">אוקטובר 2026</span></section>' +
      '<article class="box shadow"><h2>מה נמדד</h2><p style="font-size:18px;line-height:1.7">בטבלת הדירוג של SkillsBench, 34 מודלים נבדקו על אותן משימות, פעם בלי סקילים ופעם איתם. בממוצע, שיעור ההצלחה עלה מ־36% ל־51%.</p><p style="font-size:18px;line-height:1.7">שימו לב: המדידה היא על משימות, לא על סקיל מסוים.</p><span class="note" style="font-weight:600">מקור: Vals AI, טבלת SkillsBench · עודכן 27.09.2026</span></article>' +
      '<article class="box" style="background:var(--red)"><h2>מתי לבדוק פעמיים לפני התקנה</h2><ul><li>יש שני סקילים עם אותו שם, ממפרסמים שונים.</li><li>הרבה התקנות, אבל כמעט אין פעילות בריפו.</li><li>הסקיל מבקש גישה רחבה בלי סיבה ברורה.</li></ul><p style="font-size:18px;line-height:1.7">במקרה כזה, העדיפו את המקור המקורי ובדקו מי המפרסם.</p></article>' +
      '<article class="box shadow"><h2>למה לא להוריד חבילה שלמה</h2><p style="font-size:18px;line-height:1.7">חבילות גדולות כוללות הרבה סקילים חופפים. כשיש כמה סקילים לאותה משימה, ה־AI עלול לבחור את הלא נכון, וכל סקיל מותקן תופס מקום גם כשלא משתמשים בו.</p><p style="font-size:18px;line-height:1.7">העיקרון פשוט: מתקינים רק את מה שמתאים לעבודה שלך, ומוסיפים עוד כשיש צורך.</p></article>' +
      '<article class="box" style="background:var(--blue)"><h2>טיפ</h2><p style="font-size:18px;line-height:1.7">רוב הטוקנים הולכים על מה שה־AI קורא, לא על מה שהוא כותב. סקיל שמסנן את מה שנכנס לשיחה חוסך בדרך כלל יותר מסקיל שמקצר תשובות.</p></article></div>';
  }
  function legal() {
    return '<div class="wrap page" style="max-width:1000px;gap:28px"><section class="page-head in"><h1>מידע משפטי</h1><span class="tag" style="align-self:flex-start;background:var(--pink)">טיוטה לבדיקת עורך דין</span></section>' +
      '<article id="terms" class="box shadow"><h2>תנאי שימוש</h2><ul style="font-size:17px"><li>SkillForYou הוא מדריך מידע. הוא לא מפתח, לא מארח ולא בודק את הקוד של הסקילים.</li><li>כל סקיל מותקן ישירות מהמקור של היוצר, ובאחריות המשתמש.</li><li>המידע מבוסס על מקורות ציבוריים ועשוי להשתנות. כל מידע שלא נבדק מסומן ככזה.</li><li>אין באתר ייעוץ משפטי, פיננסי או מקצועי, גם כשמוצגים סקילים בתחומים האלה.</li></ul></article>' +
      '<article id="privacy" class="box"><h2>מדיניות פרטיות</h2><ul style="font-size:17px"><li>אין באתר הרשמה, חשבונות או רשימת תפוצה.</li><li>האתר משתמש ב־Cloudflare Web Analytics כדי לספור כניסות לעמודים. הכלי לא משתמש בעוגיות, לא שומר מידע בדפדפן ולא עוקב אחרי גולשים בין אתרים. נשמרים רק נתונים מצטברים, כמו מספר כניסות, מדינה, סוג מכשיר ודפדפן.</li><li>בטופס הדיווח, כתובת המייל היא רשות, ומשמשת רק לחזרה אליך.</li><li>לשאלות על המידע שלך: [כתובת מייל ליצירת קשר].</li></ul></article>' +
      '<article id="a11y" class="box"><h2>הצהרת נגישות</h2><p style="font-size:17px;line-height:1.7">האתר נבנה לפי התקן הישראלי 5568, ברמת AA. אפשר לנווט בכל האתר עם המקלדת, הטקסט עומד ביחסי ניגודיות מומלצים, ומי שהגדיר במכשיר הפחתת תנועה יקבל את האתר בלי הנפשות.</p><p style="font-size:17px;line-height:1.7">נתקלת בבעיית נגישות? אפשר לפנות אל [שם רכז/ת הנגישות], בטלפון [מספר] או במייל [כתובת].</p><span class="note" style="font-weight:600">ההצהרה עודכנה: [תאריך הבדיקה האחרונה]</span></article>' +
      '<article id="report" class="box" style="background:var(--green)"><h2>דיווח או בקשת עדכון</h2><p style="font-size:17px">יש טעות במידע על סקיל? אתה היוצר ורוצה לעדכן או להסיר אותו? ספר לנו, ונבדוק.</p>' +
      '<form class="req" data-type="report" style="display:flex;flex-direction:column;gap:14px"><input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px"><label class="field">על איזה סקיל מדובר<input name="skill" type="text" placeholder="שם הסקיל או קישור"></label>' +
      '<fieldset style="margin:0;padding:0;border:0;display:flex;flex-wrap:wrap;gap:10px"><legend style="padding:0;margin-bottom:8px;font-size:16px;font-weight:700">מה תרצה</legend>' +
      ['לתקן מידע', 'אני היוצר, רוצה להסיר', 'בעיית אבטחה'].map(function (k) {
        return '<label style="display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;background:#fff;border:2px solid var(--ink);border-radius:999px;font-size:16px;cursor:pointer"><input type="radio" name="kind" value="' + k + '" style="width:18px;height:18px;margin:0;accent-color:#141414">' + k + '</label>'; }).join('') + '</fieldset>' +
      '<label class="field">פרטים<textarea name="details" rows="4"></textarea></label><label class="field">מייל לחזרה (רשות)<input name="email" type="email" dir="ltr" placeholder="your@email.com" style="text-align:right"></label>' +
      '<button type="submit" class="btn pink head shadow" style="align-self:flex-start">שליחה</button></form></article></div>';
  }
  function notFound() {
    return '<div class="wrap page"><section class="box shadow in" style="align-items:flex-start"><h1 style="font-size:44px">לא מצאנו את העמוד הזה</h1><a class="btn yellow" href="#/">לקטלוג</a></section></div>';
  }

  /* ---------- router ---------- */
  var NAV = [['/', 'קטלוג'], ['/build', 'בנו לי סט'], ['/guides', 'מדריכים'], ['/models', 'מודלים'], ['/updates', 'עדכונים']];
  function route(keepScroll) {
    var path = (location.hash || '#/').slice(1) || '/';
    var parts = path.split('/').filter(Boolean);
    var html, title = 'SkillForYou · מדריך פשוט לסקילים של AI', active = '/';
    if (!parts.length) html = home();
    else if (parts[0] === 'skill') {
      var s = byId[decodeURIComponent(parts[1] || '')];
      if (s && !s._loaded) {
        html = '<div class="wrap page"><p class="note" style="font-size:17px">טוען…</p></div>';
        fetch('data/d/' + encodeURIComponent(s.id) + '.json?v=' + (window.SF_V || '')).then(function (r) { return r.ok ? r.json() : {}; }, function () { return {}; })
          .then(function (d) { Object.assign(s, d); s._loaded = true; if ((location.hash || '').indexOf('#/skill/' + s.id) === 0) route(true); });
      } else html = skillPage(s);
      if (s) title = s.title + ' · SkillForYou';
    }
    else if (parts[0] === 'build') { html = build(); active = '/build'; title = 'בנו לי סט · SkillForYou'; }
    else if (parts[0] === 'guides') { html = guides(); active = '/guides'; title = 'מדריכים · SkillForYou'; }
    else if (parts[0] === 'guide') { html = guide(parts[1]); active = '/guides'; title = 'מדריך · SkillForYou'; }
    else if (parts[0] === 'students') { html = students(); active = '/guides'; title = 'סקילים לסטודנטים · SkillForYou'; }
    else if (parts[0] === 'models') { html = models(); active = '/models'; title = 'מודלים · SkillForYou'; }
    else if (parts[0] === 'updates') { html = updates(); active = '/updates'; title = 'עדכונים · SkillForYou'; }
    else if (parts[0] === 'legal') { html = legal(); active = ''; title = 'מידע משפטי · SkillForYou'; }
    else html = notFound();
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
  function rerender() { var y = window.scrollY; route(true); window.scrollTo(0, y); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var v = b.getAttribute('data-v'), act = b.getAttribute('data-act');
    if (act === 'need') { st.need = v; st.shown = 24; if (v === 'all') { st.q = ''; var qi = $('#q'); if (qi) qi.value = ''; } refreshCatalog(); }
    else if (act === 'more') { st.shown += 48; refreshCatalog(); }
    else if (act === 'try') { st.q = v; st.need = 'all'; st.shown = 24; $('#q').value = v; refreshCatalog(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }
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
    else if (act === 'buildtry') { st.bq = v; rerender(); var r = $('#results'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }
  });
  function refreshCatalog() { var c = $('#catalog'); if (c) c.innerHTML = catalogBody(); }
  var timer, btimer;
  document.addEventListener('input', function (e) {
    if (e.target.id === 'q') { clearTimeout(timer); var v = e.target.value; timer = setTimeout(function () { st.q = v; st.shown = 24; refreshCatalog(); }, 150); }
    if (e.target.id === 'bq') { st.bq = e.target.value; clearTimeout(btimer); btimer = setTimeout(function () { var r = $('#results'); if (r) r.innerHTML = buildResults(); }, 280); }
  });
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    if (e.target.id === 'searchform') { document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); return; }
    if (e.target.id === 'buildform') { st.bq = $('#bq').value; var r = $('#results'); r.innerHTML = buildResults(); r.scrollIntoView({ behavior: 'smooth' }); return; }
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
      s._text = [s.title, s.what, s.ask, s.name, s.repo, s.job, s.desc, C[s.need] && C[s.need].label].join(' ').toLowerCase().replace(/[״"׳']/g, '');
    });
    S.sort(function (a, b) { return (a.level === 'everyday' ? 0 : 1) - (b.level === 'everyday' ? 0 : 1); });
    engine = new window.SFMatch.Engine(S);
    route();
  }).catch(function () { $('#main').innerHTML = '<div class="wrap page"><p class="box">לא הצלחנו לטעון את הקטלוג. נסו לרענן.</p></div>'; });
})();
