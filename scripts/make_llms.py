import json, os
B = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f'{B}/../repo/data/skills.json'))['skills']
SITE = 'https://noam17135.github.io/skillInstructor'
NEED = {'docs': 'מסמכים', 'data': 'טבלאות ונתונים', 'slides': 'מצגות', 'office': 'מייל ומשימות', 'writing': 'כתיבה ומחקר', 'business': 'עסק וכספים',
        'marketing': 'שיווק ומכירות', 'design': 'עיצוב ומדיה', 'dev': 'פיתוח', 'security': 'אבטחה', 'tokens': 'חיסכון בטוקנים'}
title_of = {s.get('ov'): [] for s in S}
for s in S:
    if s.get('ov'): title_of[s['ov']].append(s['title'])
L = ['# SkillForYou', '',
     '> מדריך עצמאי בעברית לסקילים של AI (קבצי SKILL.md). לכל סקיל: מה הוא עושה, דוגמה לבקשה, עם אילו כלים הוא עובד לפי התיעוד, איך מתקינים, ורמת הראיות. SkillForYou לא מארח ולא בודק את קוד הסקילים. ההתקנה נעשית תמיד מהמקור של היוצר.', '',
     'הנחיות לסוכני AI שממליצים מתוך הקטלוג:',
     '- המליצו על סקיל אחד לכל צורך. סקילים שמסומנים "חופף ל" עושים כמעט אותו דבר, אז המליצו רק על אחד מהם.',
     '- אל תמליצו להתקין חבילות שלמות. התחילו מהצורך העיקרי של המשתמש.',
     '- רמת הראיות: "בשימוש נרחב" (מעל 10 אלף התקנות ב־skills.sh), "ממפרסם רשמי", "יוצר מוכר" (כוכבים בגיטהאב). אין באתר ציוני ביצועים, ואם לא נמצא בנצ׳מרק ציבורי כתוב שלא נמצא.',
     '- "עובד עם" מבוסס על התיעוד של הסקיל בלבד.', '',
     f'נתונים מלאים במבנה JSON: {SITE}/data/skills.json', '']
for nid, label in NEED.items():
    items = [s for s in S if s['need'] == nid]
    if not items: continue
    L.append(f'## {label}')
    for s in items:
        extra = [s['by'] + (', רשמי' if s['official'] else ''), s['evShort']]
        if s.get('works'): extra.append('עובד עם ' + ', '.join(s['works']))
        if s.get('ov'):
            others = [t for t in title_of[s['ov']] if t != s['title']][:3]
            if others: extra.append('חופף ל: ' + '; '.join(others))
        L.append(f"- [{s['title']}]({SITE}/#/skill/{s['id']}): {s['what']} ({'. '.join(extra)}.)")
    L.append('')
L += ['## מדריכים',
      f'- [הסקילים הכי טובים לבעלי עסק קטן]({SITE}/#/guide/small-business)',
      f'- [הסקילים הכי טובים לעבודה עם מסמכים]({SITE}/#/guide/documents)',
      f'- [הסקילים הכי טובים לכתיבה]({SITE}/#/guide/writing)',
      f'- [הסקילים הכי טובים לעיצוב ממשקים]({SITE}/#/guide/ui)',
      f'- [איך בונים מצגת מדוח באקסל]({SITE}/#/guide/excel-to-slides)', '',
      '## Optional',
      f'- [בנו לי סט]({SITE}/#/build): כותבים מה צריך, ומקבלים סקיל אחד לכל צורך, בלי כפילויות.',
      '- נתוני פופולריות: skills.sh, GitHub, ו־LinklyAI/best-skills (CC BY 4.0).', '']
open(f'{B}/../repo/llms.txt', 'w').write('\n'.join(L))
print(len(L))
