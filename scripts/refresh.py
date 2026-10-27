"""Weekly refresh of the live facts on every skill: install counts, GitHub stars, last update date,
archived repos, and the evidence label derived from them. Then rebuilds llms.txt and the version stamp.

Runs in GitHub Actions (see .github/workflows/refresh.yml) and needs no other files:
- install counts: the public LinklyAI/best-skills dataset (CC BY 4.0), skills.sh all-time view
- stars / last push / archived: the GitHub API (GITHUB_TOKEN when available)
Nothing is added or removed from the catalog here; only facts about existing skills change.
"""
import csv, glob, json, os, subprocess, sys, tempfile, urllib.request, concurrent.futures as cf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
IDX = os.path.join(ROOT, 'data', 'skills.json')
TOKEN = os.environ.get('GITHUB_TOKEN', '')


def fmt_k(n):
    if n >= 1_000_000:
        return (f'{n / 1_000_000:.1f}'.rstrip('0').rstrip('.')) + ' מיליון'
    return f'{round(n / 1000)} אלף'


def evidence(installs, stars, official, month):
    if installs >= 10000:
        return 'בשימוש נרחב', fmt_k(installs) + ' התקנות', fmt_k(installs) + f' התקנות · skills.sh, {month}'
    if installs >= 1000:
        return 'בשימוש', f'{installs:,} התקנות', f'{installs:,} התקנות · skills.sh, {month}'
    if official:
        return 'ממפרסם רשמי', 'מפרסם רשמי', 'אין עדיין נתוני התקנות'
    if stars >= 1000:
        return 'יוצר מוכר', fmt_k(stars) + ' כוכבים', fmt_k(stars) + f' כוכבים בגיטהאב · {month}'
    if stars:
        return 'פעיל בגיטהאב', f'{stars:,} כוכבים', f'{stars:,} כוכבים בגיטהאב · {month}'
    return 'מעט נתונים', 'מעט נתונים', 'לא מצאנו עדיין נתוני התקנות או כוכבים'


def installs_from_dataset():
    """Latest all-time install counts per (repo, skill) from LinklyAI/best-skills."""
    out = {}
    with tempfile.TemporaryDirectory() as d:
        try:
            subprocess.run(['git', 'clone', '-q', '--depth', '1', 'https://github.com/LinklyAI/best-skills', d], check=True, timeout=600)
        except Exception as e:
            print('dataset clone failed:', e)
            return out
        files = sorted(glob.glob(os.path.join(d, 'data', '20*', 'raw', 'skills-sh.csv')))
        for f in files[-14:]:  # last two weeks of snapshots
            for r in csv.DictReader(open(f, encoding='utf-8')):
                if r.get('view') != 'all-time':
                    continue
                k = (r['source'].lower(), r['name'].lower())
                try:
                    v = int(r['installs'] or 0)
                except ValueError:
                    continue
                out[k] = max(out.get(k, 0), v)
    return out


def repo_info(repo):
    if '/' not in repo:
        return repo, None
    req = urllib.request.Request(f'https://api.github.com/repos/{repo}', headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'skill-catalog-refresh'})
    if TOKEN:
        req.add_header('Authorization', f'Bearer {TOKEN}')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            j = json.load(r)
        return repo, dict(stars=j.get('stargazers_count', 0), pushed=(j.get('pushed_at') or '')[:10], archived=bool(j.get('archived')))
    except Exception as e:
        print('repo lookup failed:', repo, str(e)[:80])
        return repo, None


def main():
    import datetime
    month = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'][datetime.date.today().month - 1] + f' {datetime.date.today().year}'
    data = json.load(open(IDX, encoding='utf-8'))
    skills = data['skills']
    inst = installs_from_dataset()
    repos = sorted({s['repo'] for s in skills})
    if os.environ.get('REFRESH_NO_API'):
        info = {}
    else:
        with cf.ThreadPoolExecutor(8) as ex:
            info = dict(ex.map(repo_info, repos))
    changed = 0
    for s in skills:
        before = (s.get('installs'), s.get('evShort'), s.get('updated'), s.get('archived'), s.get('stars'))
        k = (s['repo'].lower(), s['name'].lower())
        s['installs'] = max(s.get('installs') or 0, inst.get(k, 0))  # never drop a known count to zero
        i = info.get(s['repo'])
        if i:
            s['stars'] = i['stars']
            if i['pushed']:
                s['updated'] = i['pushed']
            if i['archived']:
                s['archived'] = True
            else:
                s.pop('archived', None)
        # recompute only from data we actually have; never erase a label because a lookup failed
        if i or s['installs'] or s.get('stars') or s.get('official'):
            s['evidence'], s['evShort'], s['evDetail'] = evidence(s['installs'], s.get('stars') or 0, bool(s.get('official')), month)
        if before != (s.get('installs'), s.get('evShort'), s.get('updated'), s.get('archived'), s.get('stars')):
            changed += 1
    data['updated'] = datetime.date.today().isoformat()
    json.dump(data, open(IDX, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('skills changed:', changed, '| installs known:', sum(1 for s in skills if s.get('installs')), '| archived:', sum(1 for s in skills if s.get('archived')))
    subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'llms_build.py')], check=True)
    subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'stamp.py')], check=True)


if __name__ == '__main__':
    main()
