/* SkillFit matching engine: free-text Hebrew/English matching against the catalog.
   Runs entirely in the browser. No AI at query time: each skill carries a vocabulary
   (title, description, example request, and a generated list of everyday phrasings),
   and queries are matched with light Hebrew stemming, typo tolerance and IDF weighting. */
(function () {
  'use strict';

  var STOP = ('אני את אתה אנחנו הוא היא הם לי לנו לך שלי שלנו שלך של עם על אל גם כמו זה זאת זו יש אין מה איך למה מתי ' +
    'רוצה רוצים רוצות צריך צריכה צריכים צריכות אפשר בבקשה הרבה מאוד ממש קצת כל כדי או אבל וגם ועוד עוד רק כבר ' +
    'לעשות עושה עושים משהו דברים דבר שה שזה יותר פחות טוב טובה טובים בשביל לגבי אצלי אצלנו מישהו הזה הזאת ' +
    'סטודנט סטודנטית סטודנטים לא כן אם מול לפני אחרי בין תוך דרך ככה כזה כזאת לדעת לראות לקבל לתת שיהיה יהיה היה אולי בא תמיד הכל הכול צריכה מכין מכינה כותב כותבת עובד עובדת מנהל מנהלת ' +
    'עזרה לעזור תעזור תעזרי עוזר כלי סקיל סקילים ai בינה מלאכותית יום יומי ' +
    'i im i\'m me my we our you the a an to for of and or with in on want need help please some skill skills tool').split(/\s+/);
  var STOPSET = {};

  var PREFIXES = ['וכש', 'ושה', 'וכשה', 'מה', 'שה', 'וה', 'וב', 'ול', 'ומ', 'וש', 'כש', 'לה', 'בה', 'ו', 'ה', 'ב', 'ל', 'מ', 'ש', 'כ'];
  var SUFFIXES = ['יות', 'ויות', 'ים', 'ות', 'יה', 'ית', 'ה', 'ת', 'י'];
  var HEB = /[֐-׿]/;
  var FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

  function clean(s) {
    return String(s || '').toLowerCase()
      .replace(/[֑-ׇ]/g, '')            // niqqud
      .replace(/[״"׳'`]/g, '')
      .replace(/[־–—]/g, ' ')
      .replace(/[^֐-׿a-z0-9+#.\s-]/g, ' ')
      .replace(/(^|\s)[.-]+|[.-]+(\s|$)/g, ' ');
  }
  STOP.forEach(function (w) { STOPSET[w] = 1; STOPSET[fin(w)] = 1; });
  function words(s) { return clean(s).split(/\s+/).filter(Boolean); }
  function fin(w) { return w.replace(/[ךםןףץ]/g, function (c) { return FINALS[c]; }); }

  // all reasonable stems of a word (most specific first)
  function stems(w) {
    var out = [w];
    if (!HEB.test(w)) {
      if (w.length > 4 && /s$/.test(w)) out.push(w.slice(0, -1));
      if (w.length > 5 && /ing$/.test(w)) out.push(w.slice(0, -3));
      return out;
    }
    var bases = [w];
    PREFIXES.forEach(function (p) {
      if (w.length - p.length >= 3 && w.indexOf(p) === 0) bases.push(w.slice(p.length));
    });
    bases.forEach(function (b) {
      var fb = fin(b);
      if (out.indexOf(fb) === -1) out.push(fb);
      SUFFIXES.forEach(function (sfx) {
        if (b.length - sfx.length >= 3 && b.slice(-sfx.length) === sfx) {
          var r = fin(b.slice(0, -sfx.length));
          if (out.indexOf(r) === -1) out.push(r);
        }
      });
    });
    return out.map(fin).filter(function (x, i, a) { return a.indexOf(x) === i; });
  }

  function editDist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < rowMin) rowMin = cur[j];
      }
      if (rowMin > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  var FIELDS = [['title', 3], ['syn', 2.6], ['name', 2], ['job', 2], ['ask', 1.4], ['what', 1.4], ['best', 1.4], ['desc', 0.6]];

  function Engine(skills) {
    this.skills = skills;
    this.index = {};      // stem -> {skillIdx: weight}
    this.phrases = [];    // [normalized phrase, skillIdx]
    var self = this;
    skills.forEach(function (s, idx) {
      var seen = {};
      FIELDS.forEach(function (f) {
        var v = s[f[0]]; if (!v) return;
        var txt = Array.isArray(v) ? v.join(' , ') : v;
        words(txt).forEach(function (w) {
          if (STOPSET[w] || w.length < 2) return;
          stems(w).forEach(function (st, k) {
            var wgt = f[1] * (k === 0 ? 1 : 0.85);
            var key = st + '|' + idx;
            if ((seen[key] || 0) >= wgt) return;
            seen[key] = wgt;
            (self.index[st] = self.index[st] || {})[idx] = wgt;
          });
        });
        if (f[0] === 'syn' || f[0] === 'title') {
          (Array.isArray(v) ? v : [v]).forEach(function (p) {
            var n = words(p).join(' ');
            if (n.split(' ').length >= 2 && n.length >= 6) self.phrases.push([n, idx]);
          });
        }
      });
    });
    this.vocab = Object.keys(this.index);
    this.N = skills.length;
  }

  // map each query word to the index stems it hits
  Engine.prototype.analyse = function (q) {
    var self = this, out = [];
    words(q).forEach(function (w) {
      if (STOPSET[w] || w.length < 2) return;
      if (stems(w).some(function (st) { return STOPSET[st]; })) return;
      var hits = stems(w).filter(function (st) { return self.index[st]; });
      var fuzzy = false;
      if (!hits.length && w.length >= 4) {
        var max = w.length >= 7 ? 2 : 1, best = null, bd = max + 1, base = fin(w);
        for (var i = 0; i < self.vocab.length; i++) {
          var v = self.vocab[i];
          if (Math.abs(v.length - base.length) > max || v[0] !== base[0] && v[v.length - 1] !== base[base.length - 1]) continue;
          var d = editDist(base, v, max);
          if (d < bd) { bd = d; best = v; if (d === 1 && max === 1) break; }
        }
        if (best) { hits = [best]; fuzzy = true; }
      }
      if (hits.length) out.push({ word: w, stems: hits.slice(0, 3), fuzzy: fuzzy });
    });
    return out;
  };

  Engine.prototype.idf = function (st) {
    var df = Object.keys(this.index[st] || {}).length || 1;
    return Math.log(1 + this.N / df);
  };

  // score all skills for a list of analysed tokens; returns [{idx, score, words:[...]}]
  Engine.prototype.score = function (tokens, normQ) {
    var self = this, acc = {};
    tokens.forEach(function (t) {
      var bestPer = {};
      t.stems.forEach(function (st, k) {
        var idf = self.idf(st), post = self.index[st];
        for (var idx in post) {
          var v = post[idx] * idf * (k === 0 ? 1 : 0.9) * (t.fuzzy ? 0.7 : 1);
          if (!bestPer[idx] || v > bestPer[idx]) bestPer[idx] = v;
        }
      });
      for (var idx in bestPer) {
        var a = acc[idx] = acc[idx] || { idx: +idx, score: 0, words: [] };
        a.score += bestPer[idx];
        a.words.push(t.word);
      }
    });
    if (normQ) this.phrases.forEach(function (p) {
      if (normQ.indexOf(p[0]) !== -1 && acc[p[1]]) acc[p[1]].score += 4;
    });
    return Object.keys(acc).map(function (k) { return acc[k]; });
  };

  var NICHE = ['lark', 'feishu', 'azure', 'aws', 'gcp', 'google cloud', 'gke', 'vercel', 'supabase', 'prisma', 'expo', 'remotion', 'hyperframes',
    'opencode', 'clawdbot', 'openclaw', 'caveman', 'agentshield', 'kubernetes', 'k8s', 'django', 'spring', 'golang', 'solidity', 'electron', 'higgsfield', 'stitch', 'octopus', 'tenable'];
  function prior(s, ctx) {
    var m = 1;
    var hay = (s.title + ' ' + s.name + ' ' + s.repo).toLowerCase();
    for (var n = 0; n < NICHE.length; n++) if (hay.indexOf(NICHE[n]) !== -1 && ctx.q.indexOf(NICHE[n]) === -1) { m *= 0.62; break; }
    if (s.rich) m *= 1.12;
    if (s.level === 'everyday' && !ctx.dev) m *= 1.1;
    if (s.official) m *= 1.05;
    m *= 1 + Math.min(0.2, Math.log10(1 + (s.installs || 0)) / 30);
    if (ctx.tool) {
      if (!s.works || !s.works.length) m *= 0.85;
      else if (!s.works.some(function (w) { return w === ctx.tool || w === ctx.tool + ' (Cowork)'; })) m *= 0.55;
    }
    return m;
  }
  var DEV_HINT = /(קוד|מפתח|פיתוח|באג|react|next|api|דיפלוי|deploy|git|טסט|frontend|backend|פרונט|באקנד|typescript|python)/;

  // ranked search for the catalog box
  Engine.prototype.search = function (q, opts) {
    opts = opts || {};
    var toks = this.analyse(q);
    if (!toks.length) return [];
    var ctx = { dev: DEV_HINT.test(clean(q)), tool: opts.tool, q: clean(q) };
    var nq = words(q).join(' '), self = this;
    var res = this.score(toks, nq).map(function (r) {
      var cover = r.words.length / toks.length;
      r.score = r.score * prior(self.skills[r.idx], ctx) * (0.55 + 0.45 * cover);
      return r;
    }).sort(function (a, b) { return b.score - a.score; });
    if (!res.length) return [];
    var top = res[0].score;
    return res.filter(function (r) { return r.score >= top * 0.22 && r.score >= 2.2; });
  };

  // free-text "build me a set": greedily pick skills that explain different parts of the text
  Engine.prototype.cover = function (q, opts) {
    opts = opts || {};
    var self = this, toks = this.analyse(q), nq = words(q).join(' ');
    var ctx = { dev: DEV_HINT.test(clean(q)), tool: opts.tool, q: clean(q) };
    var remaining = toks.slice(), picks = [], skipped = [], usedOv = {}, usedIdx = {};
    var minScore = 3.2;
    for (var round = 0; round < 6 && remaining.length; round++) {
      var ranked = this.score(remaining, round === 0 ? nq : null).map(function (r) {
        r.score *= prior(self.skills[r.idx], ctx); return r;
      }).filter(function (r) { return !usedIdx[r.idx]; }).sort(function (a, b) { return b.score - a.score; });
      var pick = null;
      for (var i = 0; i < ranked.length; i++) {
        var s = self.skills[ranked[i].idx];
        if (s.ov && usedOv[s.ov] !== undefined) {
          if (skipped.length < 6 && !skipped.some(function (k) { return k.s === s; }))
            skipped.push({ s: s, instead: self.skills[usedOv[s.ov]] });
          continue;
        }
        pick = ranked[i]; break;
      }
      if (!pick || pick.score < minScore) break;
      if (picks.length && (pick.score < 6 || pick.score < picks[0].score * (pick.words.length > 1 ? 0.25 : 0.5))) break;
      var ps = self.skills[pick.idx];
      usedIdx[pick.idx] = 1; if (ps.ov) usedOv[ps.ov] = pick.idx;
      picks.push({ s: ps, words: pick.words.slice(), score: pick.score });
      // overlapping alternatives the user doesn't need
      ranked.forEach(function (r) {
        var o = self.skills[r.idx];
        if (o !== ps && ps.ov && o.ov === ps.ov && skipped.length < 6 && !skipped.some(function (k) { return k.s === o; }))
          skipped.push({ s: o, instead: ps });
      });
      remaining = remaining.filter(function (t) { return pick.words.indexOf(t.word) === -1; });
    }
    var understood = {}; picks.forEach(function (p) { p.words.forEach(function (w) { understood[w] = 1; }); });
    var unknown = toks.filter(function (t) { return !understood[t.word]; }).map(function (t) { return t.word; }).filter(function (w) { return !/^ו?רוצ/.test(w); });
    var unmatched = words(q).filter(function (w) { return !STOPSET[w] && !stems(w).some(function (x) { return STOPSET[x]; }) && w.length > 2 && !toks.some(function (t) { return t.word === w; }); });
    return { picks: picks, skipped: skipped, leftover: unknown.concat(unmatched), tokens: toks };
  };

  window.SFMatch = { Engine: Engine, words: words, stems: stems };
})();
