"""For every repo in the catalog: real date of the last commit, and (for repos marked official)
whether the README disclaims being an official product. Shallow, blob-less clones, deleted after use."""
import json, os, re, subprocess, shutil, concurrent.futures as cf
B = '/home/claude/site/build'
repos = json.load(open(f'{B}/all_repos.json'))
skills = json.load(open('/home/claude/site/repo/data/skills.json'))['skills']
official = {s['repo'] for s in skills if s.get('official')}
OUT = f'{B}/repo_meta.json'
meta = json.load(open(OUT)) if os.path.exists(OUT) else {}
TMP = '/tmp/claude-0/-home-claude/20aefb20-40cc-5247-a7e4-685e4ca955b5/scratchpad/meta_clones'
os.makedirs(TMP, exist_ok=True)
DISC = re.compile(r'not an? (officially supported|official)[^.\n]{0,80}(google|product|microsoft)|not (affiliated|endorsed) with|unofficial|community[- ]maintained|this is not an official', re.I)
def run(repo):
    if repo in meta and meta[repo].get('last_commit') and repo not in official: return repo, meta[repo]
    d = os.path.join(TMP, repo.replace('/', '__'))
    shutil.rmtree(d, ignore_errors=True)
    res = {}
    try:
        subprocess.run(['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--no-checkout', f'https://github.com/{repo}', d], check=True, timeout=120, capture_output=True)
        res['last_commit'] = subprocess.run(['git', '-C', d, 'log', '-1', '--format=%cI'], capture_output=True, text=True, timeout=30).stdout.strip()
        if repo in official:
            subprocess.run(['git', '-C', d, 'sparse-checkout', 'set', '--no-cone', '/README*', '/readme*'], check=True, timeout=60, capture_output=True)
            subprocess.run(['git', '-C', d, 'checkout', '-q'], timeout=120, capture_output=True)
            txt = ''
            for f in os.listdir(d):
                if f.lower().startswith('readme'):
                    txt += open(os.path.join(d, f), encoding='utf-8', errors='ignore').read()
            txt = re.sub(r'[*_`>]', '', txt)
            m = DISC.search(txt)
            res['readme'] = bool(txt)
            res['disclaimer'] = txt[max(0, m.start() - 60): m.end() + 60].replace('\n', ' ') if m else ''
    except Exception as e:
        res['error'] = str(e)[:150]
    shutil.rmtree(d, ignore_errors=True)
    return repo, res
with cf.ThreadPoolExecutor(4) as ex:
    for repo, res in ex.map(run, repos):
        meta[repo] = res
json.dump(meta, open(OUT, 'w'), indent=0)
print('done', len(meta), sum(1 for v in meta.values() if v.get('error')), 'errors')
