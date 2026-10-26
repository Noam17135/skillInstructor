import json,re,collections
items={}
def key(repo,name): return (repo.lower().strip(), name.lower().strip())
def add(repo,name,layer,**f):
    k=key(repo,name)
    if k not in items: items[k]=dict(repo=repo,name=name,layers=[],**{x:None for x in ('title','category','what','example','envs','publisher','trust','installs','stars','url','note')})
    it=items[k]
    if layer not in it['layers']: it['layers'].append(layer)
    for a,b in f.items():
        if b not in (None,'') and not it.get(a): it[a]=b
# 1) everyday + gaps
ns={}; exec(open('gap/rows.py').read(),ns)
for need,title,tech,pub,trust,what,ex,env,needs,note,inst,stars,url,lic in ns['rows']:
    repo=re.sub(r'https://github.com/([^/]+/[^/]+).*',r'\1',url)
    add(repo,tech,'יומיומי ותחומים חסרים',needs=needs,lic=lic,title=title,category=need,what=what,example=ex,envs=env,publisher=pub,trust=trust,installs=inst,stars=stars,url=url,note=note)
# 2) craft
src=open('craft/build.py').read(); src=src[:src.index('F=')]
ns2={}; exec(src,ns2)
for a,n,repo,who,what,ex,env,ins,st,note in ns2['rows']:
    add(repo,n,'ברמה גבוהה (craft)',title=n,category=a if a!='נקודת ייחוס' else 'עיצוב ממשק',what=what,example=ex,envs=env,publisher=who,trust='יוצר מוכר / ריפו מוביל',installs=ins,stars=st,url='https://github.com/'+repo,note=note)
# 3) security / tokens (same filter as domxlsx.py)
dsrc=open('domxlsx.py').read()
rm_sec=eval(re.search(r'rm_sec=(\{.*?\})\n',dsrc,re.S).group(1)); rm_tok=eval(re.search(r'rm_tok=(\{.*?\})\n',dsrc,re.S).group(1))
for i in json.load(open('dom_final.json')):
    n=i['name']
    if i['domain']=='אבטחה' and (n in rm_sec or n.startswith('supply-chain-optimization') or n.startswith('google-cloud-solution-multi-agent')) and n!='context-mode': continue
    if i['domain']=='שימוש נכון בטוקנים' and n in rm_tok and n!='aws-secrets-manager': continue
    dom=i['domain']
    if n=='context-mode': dom='שימוש נכון בטוקנים'
    if n=='aws-secrets-manager': dom='אבטחה'
    add(i['repo'],n,dom,install=i.get('install'),official=i['official'],title=n,category=dom,what=i['desc'],publisher=i['repo'].split('/')[0],trust=i['tier'],installs=i['installs'] or None,stars=i['stars'],url=i['url'])
# 4) popular 250 (capability-mapped)
for r in json.load(open('capmap.json'))['rows']:
    cat=r['caps'][0][0] if r['caps'] else 'אחר'
    if cat=='דפדפן – רגיש': cat='דפדפן – רגיש (לבדיקה)'
    add(r['source'],r['name'],'פופולרי (טופ 250)',install=r.get('install'),official=r['official'],title=r['name'],category=cat,what=r['desc'],publisher=r['source'].split('/')[0],trust='רשמי' if r['official'] else 'פופולרי',installs=r['alltime'],stars=r['stars'],url=r['url'])
rows=list(items.values())
# layer-based ordering: curated first
LO=['יומיומי ותחומים חסרים','ברמה גבוהה (craft)','אבטחה','שימוש נכון בטוקנים','פופולרי (טופ 250)']
rows.sort(key=lambda x:(min(LO.index(l) for l in x['layers']), -(x['installs'] or 0)))

import json
json.dump(rows,open('site/build/merged.json','w'),ensure_ascii=False,indent=0)
print(len(rows))
print(collections.Counter(x['category'] for x in rows).most_common())
