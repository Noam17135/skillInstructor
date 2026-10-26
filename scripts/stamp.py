"""Writes the current version to version.txt and into index.html (as the fallback).
The page asks for version.txt without the browser cache, so visitors always get the newest files."""
import re, sys, time, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
v = sys.argv[1] if len(sys.argv) > 1 else time.strftime('%Y%m%d%H%M%S')
p = os.path.join(root, 'index.html'); s = open(p).read()
s = re.sub(r"(assets/styles\.css\?v=)[\w]+", r"\g<1>" + v, s)
s = re.sub(r"var fallback = '[\w]+';", "var fallback = '" + v + "';", s)
open(p, 'w').write(s)
open(os.path.join(root, 'version.txt'), 'w').write(v + '\n')
print('stamped', v)
