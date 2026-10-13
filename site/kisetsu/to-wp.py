import re,sys
ver=sys.argv[1]
s=open('kisetsu-src-wp.html').read()
font=re.search(r'<link href="[^"]*" rel="stylesheet">',s).group(0)
css=re.search(r'<style>([\s\S]*?)</style>',s).group(1)
body=s[s.index('<body>')+6:s.index('</body>')]
body=re.sub(r'<div class="ks-mock">[^<]*</div>','',body)
js=re.search(r'<script>[\s\S]*?</script>',body).group(0);body=body.replace(js,'')
css=css.replace('*{box-sizing:border-box;margin:0}','')
css=re.sub(r"body\{font-family:[^}]*\}",'',css,count=1)
css=re.sub(r'\.ks-mock\{[^}]*\}','',css)
head='''.c-pageTitle,.l-page__mv,.p-breadcrumb{display:none!important}
.l-content{padding-top:0!important;margin-top:0!important}
.ks-root{font-family:'Zen Maru Gothic','Hiragino Maru Gothic ProN',sans-serif;color:#2b3b42;background:#fffaf2;line-height:1.8;width:100vw;margin:0 calc(50% - 50vw);overflow:hidden}
.ks-root *{box-sizing:border-box}
.ks-root h1,.ks-root h2,.ks-root h3,.ks-root h4,.ks-root p{margin:0;padding:0;background:none!important;border:0!important}
.ks-root h1::before,.ks-root h1::after,.ks-root h2::before,.ks-root h2::after,.ks-root h3::before,.ks-root h3::after,.ks-root h4::before,.ks-root h4::after{display:none!important}
.ks-root a{text-decoration:none!important}
.ks-root button{margin:0}
'''
open('kisetsu.html','w').write(font+'\n<style>\n'+head+css+'</style>\n<div class="ks-root" data-ver="'+ver+'">\n'+body.strip()+'\n</div>\n'+js+'\n')
