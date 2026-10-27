"""Pick new catalog skills from (1) skills.sh rankings (cand.json) and (2) the GitHub SKILL.md scan.
Descriptions come from each skill's own SKILL.md. Output: new_skills.json (to be written up in Hebrew)."""
import json, re, collections

B = '/home/claude'
cat = json.load(open(f'{B}/site/repo/data/skills.json'))['skills']
have = {(s['repo'].lower(), s['name'].lower()) for s in cat}
per_repo = collections.Counter(s['repo'].lower() for s in cat)
cand = []  # skills.sh rankings are no longer a source (user's request): GitHub scan + web research only
gh = [json.loads(l) for l in open(f'{B}/site/build/gh/skills.jsonl')]
ghmap = {(g['repo'].lower(), s['name'].lower()): (g, s) for g in gh for s in g['skills']}
repo_meta = {g['repo'].lower(): g for g in gh}

BAD = re.compile(r'bug-?hunt|exploit|pentest|penetration test|red[- ]?team|offensive|\bctf\b|jailbreak|bypass|malware|phishing|keylog|crack(ing)?\b|stealth|undetect|humaniz|evade|evasion|\battack|\bhack|ddos|spam|captcha|nsfw|porn|gambl|casino|betting|weapon|surveil|doxx|scrape (linkedin|instagram|facebook)|ai[- ]detector|detection[- ]free|bypass ai', re.I)
GENERIC = re.compile(r'^(test|example|template|skill|my-skill|hello|demo|sample|todo)[-_]?\w{0,3}$', re.I)

META_NAME = re.compile(r'^(core|shared|start-here|setup|init|bootstrap|index|router|main|common|utils?|helpers?|base|overview|readme|getting-started)$|-shared$|-internal$', re.I)
META_DESC = re.compile(r'^(internal|shared[- ]reference|core usage guide|read this before|entry point|router|reference: )|internal shared|support package', re.I)
def ok_text(name, desc):
    if BAD.search(name) or BAD.search(desc): return False
    if META_NAME.search(name) or META_DESC.search(desc): return False
    if len(re.findall(r'[àâçéèêëîïôûùüÿœäöß]', desc)) >= 3: return False  # non-English descriptions
    if GENERIC.match(name): return False
    if len(desc) < 40: return False
    if re.search(r'[一-鿿]', desc) and not re.search(r'[a-zA-Z]{20,}', desc): return False  # Chinese-only
    return True

picked, why = [], collections.Counter()
taken = collections.Counter()

# (1) skills.sh rankings with real install counts
for c in cand:
    k = (c['source'].lower(), c['name'].lower())
    g = ghmap.get(k)
    desc = g[1]['desc'] if g else ''
    if not desc: why['no-desc'] += 1; continue
    if not ok_text(c['name'], desc): why['filtered'] += 1; continue
    picked.append(dict(name=c['name'], repo=c['source'], installs=c['installs'], stars=c.get('stars') or (g[0]['stars'] if g else 0),
                       official=c['official'], desc=desc, path=g[1]['path'], src='skills.sh'))
    taken[k[0]] += 1

# (2) GitHub repos: well-starred, active; up to a few skills per repo
seen = {(p['repo'].lower(), p['name'].lower()) for p in picked}
for g in sorted(gh, key=lambda x: -x['stars']):
    r = g['repo'].lower()
    skills = g.get('skills') or []
    if not skills: continue
    if len(skills) > 60: why['mega-repo'] += 1  # big collections: take only a few
    lim = 2 if len(skills) > 60 else 4
    lim = min(lim, max(0, 8 - per_repo[r] - taken[r]))
    if lim <= 0: why['repo-cap'] += 1; continue
    # prefer longer, more substantial SKILL.md files
    for s in sorted(skills, key=lambda s: -s['body_len']):
        if lim <= 0: break
        k = (r, s['name'].lower())
        if k in have or k in seen: continue
        if not ok_text(s['name'], s['desc']): why['filtered'] += 1; continue
        if s['body_len'] < 800: why['thin'] += 1; continue
        picked.append(dict(name=s['name'], repo=g['repo'], installs=0, stars=g['stars'], official=False, desc=s['desc'], path=s['path'], src='github'))
        seen.add(k); taken[r] += 1; lim -= 1

picked.sort(key=lambda x: -x['stars'])
print(len(picked), collections.Counter(p['src'] for p in picked), why)
json.dump(picked, open(f'{B}/site/build/new_skills.json', 'w'), ensure_ascii=False, indent=0)
