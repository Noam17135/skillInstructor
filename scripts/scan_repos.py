"""Sparse-clone active, well-starred repos and extract SKILL.md frontmatter (name, description).
Only SKILL.md files are checked out; each clone is deleted after parsing."""
import csv, glob, json, os, re, subprocess, shutil, concurrent.futures as cf
B = '/home/claude'
L = sorted(glob.glob(f'{B}/gap/bs/data/2026-*/raw/github-repos.csv'))[-1]
repos = [r for r in csv.DictReader(open(L)) if int(r['stars'] or 0) >= 300 and r['archived'] != 'true' and (r['pushed_at'] or '') >= '2026-07-27']
OUT = f'{B}/site/build/gh/skills.jsonl'
done = set()
if os.path.exists(OUT):
    for l in open(OUT):
        try: done.add(json.loads(l)['repo'])
        except: pass
TMP = '/tmp/claude-0/-home-claude/20aefb20-40cc-5247-a7e4-685e4ca955b5/scratchpad/clones'
os.makedirs(TMP, exist_ok=True)
FM = re.compile(r'^---\s*\n(.*?)\n---', re.S)
def field(fm, key):
    m = re.search(r'^' + key + r':\s*(.*?)(?=^\w[\w-]*:|\Z)', fm, re.S | re.M)
    if not m: return ''
    v = m.group(1).strip()
    v = re.sub(r'^[>|][-+]?\s*', '', v)
    v = ' '.join(x.strip() for x in v.splitlines())
    return v.strip('\'"').strip()
def scan(r):
    repo = r['repo']
    if repo in done: return None
    d = os.path.join(TMP, repo.replace('/', '__'))
    shutil.rmtree(d, ignore_errors=True)
    url = f'https://github.com/{repo}'
    try:
        subprocess.run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', url, d], check=True, timeout=120, capture_output=True)
        subprocess.run(['git', '-C', d, 'sparse-checkout', 'set', '--no-cone', '**/SKILL.md'], check=True, timeout=60, capture_output=True)
        subprocess.run(['git', '-C', d, 'checkout', '-q'], check=True, timeout=180, capture_output=True)
        items = []
        for root, _, files in os.walk(d):
            if '.git' in root: continue
            for f in files:
                if f != 'SKILL.md': continue
                p = os.path.join(root, f)
                try: txt = open(p, encoding='utf-8', errors='ignore').read(20000)
                except: continue
                m = FM.search(txt)
                if not m: continue
                name, desc = field(m.group(1), 'name'), field(m.group(1), 'description')
                if not name or not desc: continue
                rel = os.path.relpath(root, d)
                items.append(dict(name=name.strip(), desc=desc[:600], path=rel, body_len=len(txt)))
        res = dict(repo=repo, stars=int(r['stars']), pushed=r['pushed_at'], topics=r.get('topics', ''), repo_desc=r.get('description', ''), skills=items)
    except Exception as e:
        res = dict(repo=repo, stars=int(r['stars']), error=str(e)[:200], skills=[])
    shutil.rmtree(d, ignore_errors=True)
    return res
with open(OUT, 'a') as out, cf.ThreadPoolExecutor(4) as ex:
    for res in ex.map(scan, repos):
        if res: out.write(json.dumps(res, ensure_ascii=False) + '\n'); out.flush()
print('done')
