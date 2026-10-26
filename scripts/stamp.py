"""Adds a version stamp to asset URLs so browsers don't keep old files after an update."""
import re, sys, time, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
v = sys.argv[1] if len(sys.argv) > 1 else time.strftime('%Y%m%d%H%M')
p = os.path.join(root, 'index.html'); s = open(p).read()
s = re.sub(r'(assets/(?:app|match)\.js|assets/styles\.css)(\?v=[\w]+)?', lambda m: m.group(1) + '?v=' + v, s)
s = re.sub(r"<script>window\.SF_V='[\w]*';</script>\n?", '', s)
s = s.replace('<script src="assets/match.js', "<script>window.SF_V='" + v + "';</script>\n<script src=\"assets/match.js", 1)
open(p, 'w').write(s)
print('stamped', v)
