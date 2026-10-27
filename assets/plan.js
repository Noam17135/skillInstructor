/* Rule-based planner: understands the tool, the input and the output in a request through a fixed
   vocabulary, then picks skills by their extracted facts (what each skill reads, produces and does).
   Every choice comes with a reason and compatibility warnings. No AI at query time. */
(function () {
  'use strict';
  var W = window.SFMatch;

  var TOOLS = [
    ['Claude Code', ['claude code', 'קלוד קוד']], ['Cursor', ['cursor', 'קרסור', 'קורסור']], ['Codex', ['codex', 'קודקס']],
    ['Gemini CLI', ['gemini cli']], ['Copilot', ['copilot', 'קופיילוט']], ['ChatGPT', ['chatgpt', 'צאט גיפיטי', 'צאטגיפיטי', 'gpt']],
    ['Claude', ['claude', 'קלוד']]
  ];
  // format vocabulary → fact ids (inputs/outputs share ids)
  var FORMATS = [
    ['xlsx', 'Excel', ['excel', 'אקסל', 'xlsx', 'גיליון', 'גיליונות', 'גליון', 'spreadsheet']],
    ['gsheets', 'Google Sheets', ['google sheets', 'שיטס']],
    ['csv', 'CSV', ['csv']],
    ['pdf', 'PDF', ['pdf']],
    ['docx', 'Word', ['word', 'וורד', 'docx']],
    ['gdocs', 'Google Docs', ['google docs', 'גוגל דוקס']],
    ['pptx', 'מצגת', ['powerpoint', 'פאוורפוינט', 'מצגת', 'מצגות', 'פרזנטציה', 'פרזנטציות', 'שקפים', 'pptx', 'slides']],
    ['gslides', 'Google Slides', ['google slides']],
    ['email', 'מייל', ['מייל', 'מיילים', 'אימייל', 'email', 'gmail', 'outlook', 'דואר']],
    ['calendar', 'יומן', ['יומן', 'calendar']],
    ['chart', 'גרף', ['גרף', 'גרפים', 'chart', 'דשבורד', 'dashboard']],
    ['report', 'דוח', ['דוח', 'דוחות', 'report']],
    ['image', 'תמונה', ['תמונה', 'תמונות', 'image', 'images', 'באנר']],
    ['video', 'וידאו', ['וידאו', 'סרטון', 'סרטונים', 'video']],
    ['audio', 'אודיו', ['אודיו', 'הקלטה', 'הקלטות', 'פודקאסט', 'audio', 'podcast']],
    ['website', 'אתר', ['אתר', 'אתרים', 'דף נחיתה', 'landing page', 'website']],
    ['diagram', 'תרשים', ['תרשים', 'תרשימים', 'דיאגרמה', 'diagram']],
    ['code', 'קוד', ['קוד', 'code']],
    ['data', 'נתונים', ['נתונים', 'דאטה', 'data']]
  ];
  var INPUT_MARK = /^(מ|מה|מתוך|מנתוני|מקובץ|מקבצי|מהקובץ|from|of)$/;
  var CONVERT = /^(להפוך|להמיר|convert|turn)$/;
  var OUTPUT_VERB = /^(ליצור|לבנות|להכין|להפיק|לייצא|לכתוב|לעצב|מכין|מכינה|בונה|יוצר|יוצרת|כותב|כותבת|מפיק|מפיקה|מייצר|מייצרת|create|make|build|generate|export|write|to|into)$/;
  var ACTIONS = [
    ['create', ['ליצור', 'לבנות', 'להכין', 'להפיק', 'מכין', 'מכינה', 'בונה', 'יוצר', 'יוצרת', 'מפיק', 'create', 'build', 'make']],
    ['write', ['לכתוב', 'כותב', 'כותבת', 'לנסח', 'write', 'draft']],
    ['analyze', ['לנתח', 'ניתוח', 'analyze', 'analysis']],
    ['summarize', ['לסכם', 'סיכום', 'summarize', 'summary']],
    ['review', ['לבדוק', 'בדיקה', 'ביקורת', 'review', 'audit']],
    ['convert', ['להמיר', 'להפוך', 'convert']],
    ['edit', ['לערוך', 'לתקן', 'edit']],
    ['search', ['לחפש', 'למצוא', 'search', 'find']]
  ];
  var FLABEL = {}; FORMATS.forEach(function (f) { FLABEL[f[0]] = f[1]; });

  function norm(s) { return W.words(s).join(' '); }

  function parse(text) {
    var t = ' ' + norm(text) + ' ';
    var ws = W.words(text);
    var tool = null, used = {};
    for (var i = 0; i < TOOLS.length && !tool; i++) {
      for (var j = 0; j < TOOLS[i][1].length; j++) {
        var k = TOOLS[i][1][j];
        if (t.indexOf(' ' + k + ' ') !== -1 || t.indexOf(' ב' + k + ' ') !== -1 || t.indexOf(' עם ' + k + ' ') !== -1) { tool = TOOLS[i][0]; k.split(' ').forEach(function (x) { used[x] = 1; used['ב' + x] = 1; }); break; }
      }
    }
    var inputs = [], outputs = [], neutral = [], hitWord = {};
    ws.forEach(function (w, idx) {
      if (used[w]) return;
      FORMATS.forEach(function (f) {
        f[2].forEach(function (kw) {
          if (kw.indexOf(' ') !== -1) return;
          var stem = W.stems(w);
          var hit = w === kw || stem.indexOf(kw) !== -1 || stem.indexOf(W.stems(kw)[0]) !== -1;
          if (!hit) return;
          used[w] = 1;
          var prev = (ws[idx - 1] || '').replace(/^ו(?=.{3})/, ''), prev2 = (ws[idx - 2] || '').replace(/^ו(?=.{3})/, '');
          var pre = w.length > kw.length && w.slice(-kw.length) === kw ? w.slice(0, w.length - kw.length).replace(/^ו/, '') : '';
          var isIn = INPUT_MARK.test(prev) || CONVERT.test(prev) || pre === 'מ' || pre === 'מה' || /^מ/.test(prev) && prev.length > 3 && /נתוני|קובץ|קבצי|דוח/.test(prev);
          var isOut = !isIn && (OUTPUT_VERB.test(prev) || OUTPUT_VERB.test(prev2) || pre === 'ל' || pre === 'לה');
          var list = isIn ? inputs : isOut ? outputs : neutral;
          if (list.indexOf(f[0]) === -1) list.push(f[0]);
          hitWord[f[0]] = kw;
          if (isIn && /^מ/.test(prev)) used[prev] = 1;
        });
      });
    });
    // multi-word formats
    FORMATS.forEach(function (f) { f[2].forEach(function (kw) { if (kw.indexOf(' ') !== -1 && t.indexOf(kw) !== -1 && (hitWord[f[0]] = kw) && neutral.concat(inputs, outputs).indexOf(f[0]) === -1) neutral.push(f[0]); }); });
    // with no explicit direction: if there's a creation verb, the last format is the output
    if (!outputs.length && neutral.length && ACTIONS[0][1].concat(ACTIONS[1][1]).some(function (v) { return t.indexOf(v) !== -1; })) outputs.push(neutral.pop());
    if (!inputs.length && outputs.length && neutral.length) inputs = inputs.concat(neutral.splice(0));
    outputs = outputs.filter(function (o) { return inputs.indexOf(o) === -1; });
    // concrete file formats first ("from Excel reports" → Excel is the input that matters)
    var GENERIC = { report: 1, data: 1, text: 1, code: 1 };
    inputs.sort(function (a, b) { return (GENERIC[a] ? 1 : 0) - (GENERIC[b] ? 1 : 0); });
    var actions = [];
    ACTIONS.forEach(function (a) { if (a[1].some(function (v) { return t.indexOf(' ' + v + ' ') !== -1 || ws.some(function (w) { return W.stems(w).indexOf(v) !== -1; }); })) actions.push(a[0]); });
    return { tool: tool, inputs: inputs, outputs: outputs, neutral: neutral, actions: actions, used: used, hit: hitWord };
  }

  function quality(s) {
    var q = 1;
    if (s.rich) q += 0.6;
    if (s.official) q += 0.25;
    q += Math.min(0.6, Math.log10(1 + (s.installs || 0)) / 10);
    q += Math.min(0.3, Math.log10(1 + (s.stars || 0)) / 20);
    if (s.level === 'everyday') q += 0.15;
    if (s.pf) q -= 0.35;                       // tied to one platform the user didn't ask for
    return q;
  }
  function toolFit(s, tool) {
    if (!tool) return 0;
    var stated = (s.ft || []).concat(s.works || []);
    if (!stated.length) return 0;
    return stated.some(function (x) { return x === tool || x === tool + ' (Cowork)' || (tool === 'Claude' && /^Claude( \(Cowork\))?$/.test(x)); }) ? 1 : -1;
  }
  function has(arr, x) { return (arr || []).indexOf(x) !== -1; }

  // relevance from the text search engine: 0..1 (1 = best match), so facts and meaning both count
  function relMap(engine, q) {
    var m = {}; if (!engine || !q) return m;
    var r = engine.search(q); if (!r.length) return m;
    var top = r[0].score;
    r.slice(0, 80).forEach(function (x) { m[engine.skills[x.idx].id] = x.score / top; });
    return m;
  }
  function best(skills, filter, ctx, needRel, want) {
    var c = skills.filter(filter);
    c.forEach(function (s) {
      var pfOk = s.pf && ctx.words.some(function (w) { return w.length > 2 && s.pf.toLowerCase().indexOf(w) !== -1; });
      var ra = ctx.rel[s.id] || 0, rn = (needRel && needRel[s.id]) || 0;
      var spec = want ? 0.5 / Math.max(1, (s.fo || []).length + (s.fi || []).length - 1) : 0;
      var act = (s.fa || []).some(function (a) { return ctx.actions.indexOf(a) !== -1; }) ? 0.3 : 0;
      s._rel = Math.max(ra, rn);
      s._ps = quality(s) * 0.5 + toolFit(s, ctx.tool) * 0.8 + (pfOk ? 0.8 : 0) + ra * 1.6 + rn * 1.0 + spec + act - (s._rel ? 0 : 0.9);
    });
    c.sort(function (a, b) { return b._ps - a._ps; });
    return c;
  }

  function reasonFor(s, need) {
    var parts = [];
    if (need.in) parts.push('קורא ' + FLABEL[need.in]);
    if (need.out) parts.push('מייצר ' + FLABEL[need.out]);
    return 'לפי התיעוד שלו הוא ' + parts.join(' ו') + '.';
  }
  function warnings(s, tool) {
    var w = [];
    var stated = (s.ft || []).concat(s.works || []).filter(function (x, i, a) { return a.indexOf(x) === i; });
    if (tool) {
      var f = toolFit(s, tool);
      if (f === -1) w.push('התיעוד מזכיר רק את ' + stated.join(', ') + ', לא את ' + tool + '.');
      else if (f === 0) w.push('התיעוד לא מציין אם הוא עובד עם ' + tool + '. הפורמט פתוח, כך שבדרך כלל זה עובד.');
    }
    if (s.rc && tool) w.push(tool === 'Claude' || tool === 'ChatGPT' ? 'הוא מריץ קוד, אז צריך שהרצת קוד תהיה מופעלת באפליקציה.' : 'הוא מריץ סקריפטים או פקודות, אז הכלי צריך יכולת להריץ פקודות.');
    if (s.sv) w.push('צריך חשבון ' + s.sv + '.');
    if (s.ak) w.push('צריך מפתח API.');
    if (s.pd) w.push('צריך ' + s.pd + ', שהיא תוכנה בתשלום.');
    return w;
  }

  function plan(skills, text, opts) {
    opts = opts || {};
    var p = parse(text);
    var ctx = { tool: opts.tool || p.tool, words: W.words(text), actions: p.actions, rel: relMap(opts.engine, text) };
    var picks = [], seen = {};
    function needRel(f) { return f && p.hit[f] ? relMap(opts.engine, p.hit[f] + ' ' + (FLABEL[f] || '')) : null; }
    function altsFor(s, need) {
      return best(skills, function (o) { return o.id !== s.id && !seen[o.id] && o.altStatus !== 'dup' && ((s.ov && o.ov === s.ov) || (need.out && has(o.fo, need.out) && (!need.in || has(o.fi, need.in)))); }, ctx, null, need.out)
        .filter(function (o) { return o._rel > 0; }).slice(0, 3);
    }
    function add(s, need) {
      if (!s || seen[s.id] || !s._rel) return false;
      if (picks.some(function (q) { return q.s.ov && q.s.ov === s.ov; })) return false;
      seen[s.id] = 1;
      picks.push({ s: s, reason: reasonFor(s, need), warn: warnings(s, ctx.tool), need: need, alts: altsFor(s, need) });
      return true;
    }
    var ins = p.inputs.length ? p.inputs : p.neutral, outs = p.outputs;
    if (outs.length) {
      outs.forEach(function (o) {
        var i = ins[0], ro = needRel(o);
        var outOnly = best(skills, function (s) { return has(s.fo, o); }, ctx, ro, o);
        var both = i ? outOnly.filter(function (s) { return has(s.fi, i); }) : [];
        // one skill that covers the whole path wins if it's close to the best producer
        if (both[0] && (!outOnly[0] || both[0]._ps >= outOnly[0]._ps - 0.5) && add(both[0], { in: i, out: o })) return;
        if (i && i !== o) {
          var ri = needRel(i);
          var reader = best(skills, function (s) { return has(s.fi, i) && (has(s.fa, 'analyze') || has(s.fa, 'summarize') || has(s.fa, 'edit') || has(s.fa, 'convert') || has(s.fo, i)); }, ctx, ri, i)[0];
          add(reader, { in: i });
        }
        add(outOnly[0], { out: o });
      });
    } else if (ins.length) {
      ins.forEach(function (i) { add(best(skills, function (s) { return has(s.fi, i) || has(s.fo, i); }, ctx, needRel(i), i)[0], { in: i }); });
    }
    return { parsed: p, tool: ctx.tool, picks: picks, structured: !!picks.length };
  }

  window.SFPlan = { parse: parse, plan: plan, warnings: warnings, FLABEL: FLABEL };
})();
