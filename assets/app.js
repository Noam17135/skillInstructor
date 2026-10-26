/* SkillFit – static site. Hash routing, no build step. */
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
    { id: 'tokens', label: 'חיסכון בטוקנים', color: '#E6E6E6' }
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
      skip: 'אל תתקינו כמה סקילי סגנון ביחד. כל אחד מושך לכיוון אחר, והתוצאה יוצאת לא עקבית.' },
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
  var st = { q: '', need: 'all', level: 'everyday', shown: 24, bq: '', built: '', tool: '', install: false, adv: false };

  /* ---------- search ---------- */
  var engine = null;
  function filtered() {
    var q = st.q.trim();
    if (q && engine) {
      return engine.search(q).map(function (r) { return S[r.idx]; }).filter(function (s) {
        return st.need === 'all' || s.need === st.need;
      });
    }
    return S.filter(function (s) {
      if (st.need !== 'all' && s.need !== st.need) return false;
      return st.level === 'all' || s.level === st.level;
    });
  }
  var SITE = 'https://noam17135.github.io/skillInstructor/';
  function askAI(text, tool) {
    var prompt = 'אני מחפש סקילים (SKILL.md) לכלי ה־AI שלי' + (tool ? ' (' + tool + ')' : '') + '. זה מה שאני צריך: ' + text +
      '\nתעבור על הקטלוג של SkillFit בכתובת ' + SITE + 'llms.txt ותמליץ לי על סקיל אחד לכל צורך, בלי סקילים חופפים. לכל סקיל תסביר במשפט למה הוא מתאים ותצרף את הקישור לעמוד שלו.';
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
      '<form class="req" style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:640px">' +
      '<label class="field">מה ניסית לעשות?<textarea name="need" rows="3" placeholder="למשל: לסכם הקלטה של פגישה ולשלוח לצוות">' + esc(prefill || '') + '</textarea></label>' +
      '<label class="field">באיזה כלי AI אתה עובד? (רשות)<input name="tool" type="text" placeholder="למשל: Claude, ChatGPT, Cursor"></label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px"><button type="submit" class="btn pink head">שליחה</button>' +
      '<button type="button" class="btn yellow" data-act="clear">לראות את כל הסקילים</button></div></form></div>';
  };

  /* ---------- home ---------- */
  function catalogBody() {
    var list = filtered();
    var q = st.q.trim();
    var heading = q ? 'תוצאות עבור ״' + q + '״' : st.need !== 'all' ? 'סקילים ל' + C[st.need].label : st.level === 'everyday' ? 'סקילים לשימוש יומיומי' : st.level === 'pro' ? 'סקילים למתקדמים' : 'כל הסקילים';
    var levels = [['everyday', 'לשימוש יומיומי'], ['pro', 'למתקדמים'], ['all', 'הכול']];
    return '<div class="sec-head"><h2>' + esc(heading) + '</h2><span style="font-size:16px;font-weight:700" aria-live="polite">' + list.length + ' סקילים</span></div>' +
      (q ? '' : '<div class="levels" role="group" aria-label="רמה">' + levels.map(function (l) {
        return '<button type="button" data-act="level" data-v="' + l[0] + '" aria-pressed="' + (st.level === l[0]) + '">' + l[1] + '</button>';
      }).join('') + '</div>') +
      '<div class="row-chips" role="group" aria-label="סינון לפי צורך">' + chips(NEEDS, 'need', st.need) + '</div>' +
      (list.length ? '<div class="grid">' + list.slice(0, st.shown).map(card).join('') + '</div>' +
        (list.length > st.shown ? '<button type="button" class="btn shadow more" data-act="more">להציג עוד (' + (list.length - st.shown) + ')</button>' : '')
        : requestBox(q) + (q ? askAI(q, '') : ''));
  }
  function home() {
    var tries = [['לחבר קבצי PDF', 'PDF'], ['מצגת', 'מצגת'], ['מיילים', 'מייל'], ['תזרים', 'תזרים']];
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
      [s.evidence + ': ' + s.evDetail, s.evidence === 'ממפרסם רשמי' ? '#FFE08A' : '#9BE38A', s.evidence === 'ממפרסם רשמי' ? 'M12 7v6M12 17h.01' : 'M5 12l5 5 9-10'],
      ['סריקת אבטחה חיצונית: לא נמצאה עדיין', '#FFFFFF', 'M7 12h10']
    ];
    var overlaps = s.ov ? (byOv[s.ov] || []).filter(function (o) { return o.id !== s.id; }) : [];
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
      (s.best && s.best.length ? '<div class="row-chips"><span style="font-weight:700">מתאים במיוחד ל:</span>' + s.best.map(function (b) {
        return '<span class="tag" style="background:var(--cream);font-weight:600">' + esc(b) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="row-chips" style="font-weight:400"><span>מאת <strong>' + esc(s.by) + '</strong></span>' +
      (s.official ? '<span class="dark-tag">מפרסם רשמי</span>' : '') + '<span class="tag">' + esc(s.evidence) + '</span></div></div>' +
      '<button type="button" class="btn pink big install" data-act="install" aria-expanded="' + st.install + '" aria-controls="installbox">להתקנה</button></section>' +
      (st.install ? installBox(s) : '') +
      '<div class="cols2"><div class="main">' +
      (ex.length ? '<section class="box"><h2>מה אפשר לבקש</h2>' + ex.map(function (e, i) {
        return '<div class="conv"><span class="bub-me" style="animation-delay:' + (0.15 + i * 0.4) + 's">״' + esc(e.ask) + '״</span>' +
          (e.get ? '<span class="bub-ai" style="animation-delay:' + (0.4 + i * 0.4) + 's">' + esc(e.get) + '</span>' : '') + '</div>';
      }).join('') + '</section>' : '') +
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
      '<div style="padding-top:12px;border-top:2px dashed var(--ink);display:flex;flex-direction:column;gap:4px"><strong style="font-size:16px">עם איזה מודל זה עובד הכי טוב?</strong><span class="note">לא נמצאו מבחנים ציבוריים שהשוו את הסקיל הזה בין מודלים.</span></div></section>' +
      '<section class="box sm"><h2>האם זה בטוח</h2>' + trust.map(function (t) {
        return '<div class="trust"><span class="dot" style="background:' + t[1] + '">' + mark(t[2]) + '</span><span>' + esc(t[0]) + '</span></div>'; }).join('') + '</section>' +
      '<section class="box sm" style="background:var(--cream);padding:20px 24px"><strong style="font-size:17px">מצאת בעיה בסקיל? אתה היוצר?</strong><a class="btn" style="align-self:flex-start;min-height:46px" href="#/legal/report">לדיווח או לבקשת עדכון</a></section>' +
      '<section class="box sm" style="background:var(--purple)"><h2>מה צריך כדי שיעבוד</h2><span style="font-size:16px">' + esc(s.needs || 'עוד לא בדקנו. הפרטים נמצאים במקור של הסקיל.') + '</span></section>' +
      (overlaps.length ? '<section class="box sm" style="background:var(--red)"><h2>חופף ל</h2><span style="font-size:16px">הסקילים האלה עושים כמעט אותו דבר. מספיק להתקין אחד מהם.</span>' +
        overlaps.slice(0, 5).map(function (o) { return '<a class="link-row" style="background:#fff" href="#/skill/' + esc(o.id) + '"><span>' + esc(o.title) + '</span>' + ICON.fwd + '</a>'; }).join('') + '</section>' : '') +
      (pairs.length ? '<section class="box sm"><h2>משתלב טוב עם</h2>' + pairs.map(function (o) {
        return '<a class="link-row" href="#/skill/' + esc(o.id) + '"><span>' + esc(o.title) + '</span>' + ICON.fwd + '</a>'; }).join('') + '</section>' : '') +
      '</aside></div></div>';
  }
  function installBox(s) {
    return '<section class="installbox in" id="installbox"><strong>איך מתקינים</strong>' +
      '<span style="font-size:18px">ההתקנה נעשית ישירות מהמקור של היוצר. SkillFit לא מארח את הסקיל ולא בודק את הקוד שלו.</span>' +
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
    if (!r.picks.length) return '<section class="box in" style="font-size:18px">עוד לא הבנתי מה צריך. נסו לתאר משימות, למשל ״לבנות מצגות ללקוחות״ או ״לענות מהר למיילים״.</section>' + askAI(text, st.tool);
    var h = '<section style="display:flex;flex-direction:column;gap:22px">';
    h += '<div class="understood"><span>הבנתי שאתם צריכים:</span>' + r.picks.map(function (p) {
      return '<span class="tag" style="background:' + C[p.s.need].color + '">' + esc(p.words.join(' · ')) + '</span>'; }).join('') + '</div>';
    h += '<div class="sec-head"><h2>הסט שלכם: ' + (r.picks.length === 1 ? 'סקיל אחד' : r.picks.length + ' סקילים') + '</h2></div>';
    h += '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:24px">' + r.picks.map(function (p, i) {
      var s = p.s, f = fit(s, st.tool);
      return '<div class="card ' + TILTS[i % 4] + '" style="cursor:default;gap:12px;animation-delay:' + i * 0.06 + 's">' +
        '<span class="tag" style="align-self:flex-start;background:' + C[s.need].color + '">בשביל: ' + esc(p.words.join(', ')) + '</span>' +
        '<span class="t">' + esc(s.title) + '</span><span class="w">' + esc(s.what) + '</span>' +
        '<span style="font-size:14px;font-weight:600;color:var(--muted)">' + esc(s.by) + ' · ' + esc(s.evShort) + '</span>' +
        (st.tool && f < 1 ? '<span style="padding:8px 12px;background:#FFE08A;border:2px solid var(--ink);border-radius:12px;font-size:14px;font-weight:600">' +
          (f === 0 ? 'לא מוזכר בתיעוד שעובד עם ' + esc(st.tool) + '.' : 'עוד לא בדקנו אם הוא עובד עם ' + esc(st.tool) + '.') + '</span>' : '') +
        '<a class="btn yellow" style="align-self:flex-start;margin-top:auto;min-height:46px" href="#/skill/' + esc(s.id) + '">לעמוד הסקיל</a></div>';
    }).join('') + '</div>';
    if (r.skipped.length) h += '<div class="box" style="background:var(--red)"><strong style="font-family:var(--head);font-weight:400;font-size:26px">לא הוספנו, כי זה חופף</strong>' + r.skipped.map(function (k) {
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:17px"><a class="btn" style="min-height:44px;padding:0 14px;border-width:2px;border-radius:12px" href="#/skill/' + esc(k.s.id) + '">' + esc(k.s.title) + '</a><span>עושה כמעט אותו דבר כמו ״' + esc(k.instead.title) + '״. מספיק אחד.</span></div>';
    }).join('') + '</div>';
    if (r.leftover.length) h += '<div class="box" style="background:var(--blue)"><strong style="font-family:var(--head);font-weight:400;font-size:24px">את זה עוד לא הצלחתי לשייך</strong><span style="font-size:17px">' + esc(r.leftover.slice(0, 8).join(', ')) + '. אם זה חשוב, ספרו לנו דרך הטופס בתחתית הקטלוג, או נסו לנסח אחרת.</span></div>';
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
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:26px">' + GUIDES.map(function (g, i) {
        return '<a class="card ' + TILTS[i % 4] + '" href="#/guide/' + g.id + '" style="background:' + g.color + ';padding:26px;gap:12px"><span class="t" style="font-size:28px">' + esc(g.title) + '</span>' +
          '<span style="font-size:17px">' + esc(g.short) + '</span><span style="margin-top:auto;font-size:15px;font-weight:800">' + g.items.length + ' סקילים · לקריאה</span></a>';
      }).join('') + '</div></div>';
  }
  function guide(id) {
    var g = GUIDES.filter(function (x) { return x.id === id; })[0];
    if (!g) return notFound();
    return '<div class="wrap page" style="max-width:1000px;gap:28px;padding-top:12px"><a class="btn back" href="#/guides">' + ICON.back + 'כל המדריכים</a>' +
      '<article class="in" style="display:flex;flex-direction:column;gap:24px"><header class="box" style="background:' + g.color + ';box-shadow:10px 10px 0 var(--ink);border-radius:28px;padding:34px">' +
      '<h1 style="font-size:clamp(38px,5.5vw,64px);line-height:1">' + esc(g.title) + '</h1><p style="font-size:20px;font-weight:500">' + esc(g.intro) + '</p><span style="font-size:14px;font-weight:700">עודכן: אוקטובר 2026</span></header>' +
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
      '<article id="terms" class="box shadow"><h2>תנאי שימוש</h2><ul style="font-size:17px"><li>SkillFit הוא מדריך מידע. הוא לא מפתח, לא מארח ולא בודק את הקוד של הסקילים.</li><li>כל סקיל מותקן ישירות מהמקור של היוצר, ובאחריות המשתמש.</li><li>המידע מבוסס על מקורות ציבוריים ועשוי להשתנות. כל מידע שלא נבדק מסומן ככזה.</li><li>אין באתר ייעוץ משפטי, פיננסי או מקצועי, גם כשמוצגים סקילים בתחומים האלה.</li></ul></article>' +
      '<article id="privacy" class="box"><h2>מדיניות פרטיות</h2><ul style="font-size:17px"><li>אין באתר הרשמה, חשבונות או רשימת תפוצה.</li><li>האתר משתמש ב[כלי האנליטיקה שייבחר] כדי להבין באילו עמודים משתמשים. [פרטי העוגיות וזמן השמירה].</li><li>בטופס הדיווח, כתובת המייל היא רשות, ומשמשת רק לחזרה אליך.</li><li>לשאלות על המידע שלך: [כתובת מייל ליצירת קשר].</li></ul></article>' +
      '<article id="a11y" class="box"><h2>הצהרת נגישות</h2><p style="font-size:17px;line-height:1.7">האתר נבנה לפי התקן הישראלי 5568, ברמת AA. אפשר לנווט בכל האתר עם המקלדת, הטקסט עומד ביחסי ניגודיות מומלצים, ומי שהגדיר במכשיר הפחתת תנועה יקבל את האתר בלי הנפשות.</p><p style="font-size:17px;line-height:1.7">נתקלת בבעיית נגישות? אפשר לפנות אל [שם רכז/ת הנגישות], בטלפון [מספר] או במייל [כתובת].</p><span class="note" style="font-weight:600">ההצהרה עודכנה: [תאריך הבדיקה האחרונה]</span></article>' +
      '<article id="report" class="box" style="background:var(--green)"><h2>דיווח או בקשת עדכון</h2><p style="font-size:17px">יש טעות במידע על סקיל? אתה היוצר ורוצה לעדכן או להסיר אותו? ספר לנו, ונבדוק.</p>' +
      '<form class="req" style="display:flex;flex-direction:column;gap:14px"><label class="field">על איזה סקיל מדובר<input name="skill" type="text" placeholder="שם הסקיל או קישור"></label>' +
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
  var NAV = [['/', 'קטלוג'], ['/build', 'בנו לי סט'], ['/guides', 'מדריכים'], ['/updates', 'עדכונים']];
  function route(keepScroll) {
    var path = (location.hash || '#/').slice(1) || '/';
    var parts = path.split('/').filter(Boolean);
    var html, title = 'SkillFit · מדריך פשוט לסקילים של AI', active = '/';
    if (!parts.length) html = home();
    else if (parts[0] === 'skill') { var s = byId[decodeURIComponent(parts[1] || '')]; html = skillPage(s); if (s) title = s.title + ' · SkillFit'; }
    else if (parts[0] === 'build') { html = build(); active = '/build'; title = 'בנו לי סט · SkillFit'; }
    else if (parts[0] === 'guides') { html = guides(); active = '/guides'; title = 'מדריכים · SkillFit'; }
    else if (parts[0] === 'guide') { html = guide(parts[1]); active = '/guides'; title = 'מדריך · SkillFit'; }
    else if (parts[0] === 'updates') { html = updates(); active = '/updates'; title = 'עדכונים · SkillFit'; }
    else if (parts[0] === 'legal') { html = legal(); active = ''; title = 'מידע משפטי · SkillFit'; }
    else html = notFound();
    $('#nav').innerHTML = NAV.map(function (n) {
      return '<a class="pill" href="#' + n[0] + '"' + (n[0] === active ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
    }).join('');
    $('#main').innerHTML = html;
    document.title = title;
    if (keepScroll !== true) {
      if (parts[0] === 'legal' && parts[1]) {
        setTimeout(function () { var el = document.getElementById(parts[1]); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
      } else window.scrollTo(0, 0);
    }
  }
  function rerender() { var y = window.scrollY; route(true); window.scrollTo(0, y); }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var v = b.getAttribute('data-v'), act = b.getAttribute('data-act');
    if (act === 'need') { st.need = v; st.shown = 24; refreshCatalog(); }
    else if (act === 'level') { st.level = v; st.shown = 24; refreshCatalog(); }
    else if (act === 'more') { st.shown += 48; refreshCatalog(); }
    else if (act === 'try') { st.q = v; st.need = 'all'; st.shown = 24; $('#q').value = v; refreshCatalog(); document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' }); }
    else if (act === 'clear') { st.q = ''; st.need = 'all'; st.level = 'everyday'; var q = $('#q'); if (q) q.value = ''; refreshCatalog(); }
    else if (act === 'install') { st.install = !st.install; rerender(); if (st.install) { var ib = $('#installbox'); if (ib) ib.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }
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
    if (e.target.classList.contains('req')) { toast('תודה! זו גרסת בדיקה, ועוד אין חיבור לשליחה.'); }
  });
  function toast(t) {
    var d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t;
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3200);
  }
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#main') === 0) return;
    st.install = false; st.adv = false; route();
  });
  $('#skip').addEventListener('click', function (e) { e.preventDefault(); $('#main').focus(); });

  fetch('data/skills.json').then(function (r) { return r.json(); }).then(function (d) {
    S = d.skills;
    S.forEach(function (s) {
      byId[s.id] = s; if (s.key) byKey[s.key] = s;
      if (s.ov) (byOv[s.ov] = byOv[s.ov] || []).push(s);
      s._text = [s.title, s.what, s.ask, s.name, s.repo, s.job, s.desc, C[s.need] && C[s.need].label].join(' ').toLowerCase().replace(/[״"׳']/g, '');
    });
    engine = new window.SFMatch.Engine(S);
    route();
  }).catch(function () { $('#main').innerHTML = '<div class="wrap page"><p class="box">לא הצלחנו לטעון את הקטלוג. נסו לרענן.</p></div>'; });
})();
