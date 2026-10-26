"""Builds data/skills.json for the static site from the merged catalog,
the Hebrew copy (out_*.json) and the rich hand-written pages (rich.json)."""
import json, re, collections, os

B = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(f'{B}/merged.json'))
OUT = {}
for f in ['out_0.json', 'out_1.json', 'out_2.json', 'out_3.json']:
    for x in json.load(open(f'{B}/{f}')):
        OUT[x['i']] = x
EXCL = set(json.load(open(f'{B}/excluded.json'))) | {192, 193, 196, 61}  # 61 = repo-level duplicate of emil-design-eng
RICH = {r['tech']: r for r in json.load(open(f'{B}/rich.json'))}
RICH_REPO = {'jakubkrehel/make-interfaces-feel-better': 'make-interfaces-feel-better', 'petergyang/no-ai-slop': 'no-ai-slop'}
OVERRIDES = json.load(open(f'{B}/overlaps.json')) if os.path.exists(f'{B}/overlaps.json') else {}

NEED = {
    'מסמכים': 'docs',
    'טבלאות ו־Excel': 'data', 'נתונים': 'data',
    'מצגות': 'slides', 'מצגות וגרפיקה': 'slides',
    'מייל ויומן': 'office', 'ארגון ומשימות': 'office', 'פרודוקטיביות ומשרד': 'office',
    'כתיבה': 'writing', 'כתיבה ותקשורת': 'writing', 'כתיבה וידע': 'writing', 'מחקר': 'writing', 'מחקר ולמידה': 'writing',
    'פיננסים': 'business', 'משפטי': 'business', 'משאבי אנוש': 'business', 'ניהול מוצר': 'business',
    'מכירות': 'marketing', 'שיווק': 'marketing', 'שיווק ומכירות': 'marketing', 'שירות לקוחות': 'marketing',
    'עיצוב': 'design', 'עיצוב ממשק': 'design', 'אנימציה': 'design', 'מדיה': 'design',
    'פיתוח תוכנה': 'dev', 'הנדסת תוכנה': 'dev', 'ענן ותשתיות': 'dev', 'איכות אתרים': 'dev', 'עבודה עם סוכנים': 'dev',
    'אבטחה': 'security', 'שימוש נכון בטוקנים': 'tokens',
}
heb = lambda s: bool(s and re.search('[֐-׿]', s))
strip_q = lambda s: (s or '').strip().strip('״"').strip()


def fmt_k(n):
    if n >= 1_000_000:
        v = n / 1_000_000
        return (f'{v:.1f}'.rstrip('0').rstrip('.')) + ' מיליון'
    return f'{round(n / 1000)} אלף'


def evidence(r):
    ins, stars = r.get('installs') or 0, r.get('stars') or 0
    if ins >= 10000:
        return 'בשימוש נרחב', fmt_k(ins) + ' התקנות', fmt_k(ins) + ' התקנות · skills.sh, אוקטובר 2026'
    if ins >= 1000:
        return 'בשימוש', f'{ins:,} התקנות', f'{ins:,} התקנות · skills.sh, אוקטובר 2026'
    if r.get('official'):
        return 'ממפרסם רשמי', 'מפרסם רשמי', 'אין עדיין נתוני התקנות'
    if stars >= 1000:
        return 'יוצר מוכר', fmt_k(stars) + ' כוכבים', fmt_k(stars) + ' כוכבים בגיטהאב · אוקטובר 2026'
    if stars:
        return 'פעיל בגיטהאב', f'{stars:,} כוכבים', f'{stars:,} כוכבים בגיטהאב · אוקטובר 2026'
    return 'מעט נתונים', 'מעט נתונים', 'לא מצאנו עדיין נתוני התקנות או כוכבים'


def slugify(s):
    s = s.lower().strip()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'skill'


skills, used = [], collections.Counter()
for i, r in enumerate(R):
    if i in EXCL or r['category'] in ('דפדפן – רגיש (לבדיקה)', 'לא ידוע'):
        continue
    o = OUT.get(i)
    if not heb(r['what']) and not o:
        continue
    layers = r['layers']
    curated = 'יומיומי ותחומים חסרים' in layers
    craft = 'ברמה גבוהה (craft)' in layers
    official = bool(r.get('official')) or (r.get('trust') or '').startswith('רשמי')
    s = dict(name=r['name'], repo=r['repo'], url=r.get('url') or f"https://github.com/{r['repo']}",
             need=NEED.get(r['category'], 'dev'), official=official, installs=r.get('installs') or 0,
             layers=layers, by=(r.get('publisher') or r['repo'].split('/')[0]).split(',')[0].strip())
    if o:
        s.update(title=o['title'], what=o['what'].rstrip('.') + '.', ask=strip_q(o['ask']), level=o['level'], job=o['job'], desc=r['what'])
    else:
        s.update(title=r['title'] or r['name'], what=(r['what'] or '').rstrip('.') + '.', ask=strip_q(r.get('example')), job='')
        s['level'] = 'everyday' if curated or (craft and s['need'] in ('slides', 'writing')) else 'pro'
        if curated and r.get('needs') and r['needs'] not in ('אין', ''):
            s['needs'] = r['needs'] if r['needs'].endswith('.') else r['needs'] + '.'
        elif curated:
            s['needs'] = 'אין צורך בשום חיבור.'
        if r.get('note'):
            s['note'] = r['note']
    if r.get('lic'):
        s['license'] = r['lic']
    if r.get('envs') and 'לא מצוין' not in r['envs']:
        s['works'] = [w.strip() for w in re.sub(r'\(וכלים נוספים\)|ועוד', '', r['envs']).split(',') if w.strip()]
    s['evidence'], s['evShort'], s['evDetail'] = evidence(dict(r, official=official))
    # install command
    if r.get('install'):
        s['cmd'] = r['install']
    elif craft:
        s['cmd'] = f"npx skills add {r['repo']}"
        s['cmdNote'] = 'הפקודה הזו מתקינה את כל הסקילים בריפו. בדרך כלל עדיף לבחור רק את מה שצריך עם ‎--skill‎ ושם הסקיל.'
    else:
        s['cmd'] = f"npx skills add {r['repo']} --skill {r['name']}"
    s['steps'] = 'code'
    # rich hand-written content
    rk = RICH.get(RICH_REPO.get(r['repo'], '')) if craft else RICH.get(r['name'])
    if rk:
        s.update(key=rk['id'], rich=True, title=rk['title'], what=rk['what'], ask=rk['ask'], examples=rk['examples'],
                 works=rk['works'], needs=rk['needs'], nots=rk['nots'], best=rk['best'], tryAsk=rk['tryAsk'],
                 good=rk['good'], bad=rk['bad'], cmd=rk['cmd'], license=rk['license'], pairs=rk['pairs'],
                 steps='app' if rk['steps'] and 'ומורידים' in rk['steps'][0] else 'code', level='everyday',
                 need={'docs': 'docs', 'data': 'data', 'slides': 'slides', 'mail': 'office', 'writing': 'writing', 'money': 'business', 'legal': 'business', 'design': 'design'}[rk['need']])
        s.pop('cmdNote', None)
        if rk['id'] in ('feel', 'emil'):
            s['level'] = 'pro'
    base = slugify(r['name'])
    used[base] += 1
    s['id'] = base if used[base] == 1 else f"{slugify(r['repo'].split('/')[0])}-{base}"
    skills.append(s)

# overlap groups: hand-made groups override, otherwise identical job text
ov = {}
for gname, members in OVERRIDES.get('groups', {}).items():
    for m in members:
        ov[m] = gname
for s in skills:
    if s['name'] in ov or s.get('key') in ov:
        s['ov'] = ov.get(s.get('key')) or ov.get(s['name'])
by_job = collections.defaultdict(list)
for s in skills:
    if not s.get('ov') and s.get('job'):
        by_job[s['job'].strip().lower()].append(s)
for job, ms in by_job.items():
    if len(ms) > 1 and job not in OVERRIDES.get('drop_jobs', []):
        for s in ms:
            s['ov'] = 'job:' + job
# rich pages carry their own overlap
for s in skills:
    if s.get('key') in ('inbox', 'gmail'):
        s['ov'] = 'email-assistant'
    if s.get('key') in ('feel', 'emil'):
        s['ov'] = 'ui-polish'

# order: curated/everyday first, then by installs
LO = ['יומיומי ותחומים חסרים', 'ברמה גבוהה (craft)', 'אבטחה', 'שימוש נכון בטוקנים', 'פופולרי (טופ 250)']
skills.sort(key=lambda x: (0 if x.get('rich') else 1, min(LO.index(l) for l in x['layers']), -(x['installs'] or 0)))
for s in skills:
    s.pop('layers', None)

os.makedirs(f'{B}/../repo/data', exist_ok=True)
json.dump({'updated': '2026-10', 'skills': skills}, open(f'{B}/../repo/data/skills.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(skills), collections.Counter(s['need'] for s in skills), collections.Counter(s['level'] for s in skills))
print('overlap groups', len({s['ov'] for s in skills if s.get('ov')}), 'skills in groups', sum(1 for s in skills if s.get('ov')))
print('keys', sorted(s['key'] for s in skills if s.get('key')))
