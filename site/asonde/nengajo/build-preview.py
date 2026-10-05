# 画像を埋め込んだプレビュー版（nengajo-3an-preview.html）を作る
import base64, glob, os
s = open('nengajo-3an.html', encoding='utf-8').read()
m = {os.path.basename(f)[:-5]: 'data:image/webp;base64,' + base64.b64encode(open(f, 'rb').read()).decode() for f in glob.glob('img/*.webp')}
t = s.replace("  var IMG_BASE = 'img/';", "  var EMBED = " + repr(m).replace("'", '"') + ";\n  var IMG_BASE = 'img/';", 1)
t = t.replace("IMG[id].src = IMG_BASE + id + '.webp';", "IMG[id].src = EMBED[id] || (IMG_BASE + id + '.webp');", 1)
for v in ('b.img', 'p.id', 'e.id'):
    t = t.replace("'<img src=\"'+IMG_BASE+" + v + "+'.webp\"", "'<img src=\"'+(EMBED[" + v + "]||IMG_BASE+" + v + "+'.webp')+'\"")
assert "+'.webp\" alt" not in t
open('nengajo-3an-preview.html', 'w', encoding='utf-8').write(t)
print(len(t) // 1024, 'KB')
