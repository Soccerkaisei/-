const fs=require('fs');const {minify}=require('terser');
(async()=>{
let s=fs.readFileSync('/home/user/-/site/asonde/nengajo/nengajo-maker.html','utf8');
// CSS: each <style> block to one line
s=s.replace(/<style>([\s\S]*?)<\/style>/g,(m,c)=>'<style>'+c.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').map(l=>l.trim()).filter(Boolean).join('')+'</style>');
// JS
const m=s.match(/<script>([\s\S]*?)<\/script>/);
const r=await minify(m[1],{compress:true,mangle:true,format:{ascii_only:false,max_line_len:false}});
s=s.replace(m[0],'<script>'+r.code+'</script>');
// drop blank lines
s=s.split('\n').filter(l=>l.trim()).join('\n');
fs.writeFileSync('/home/user/-/site/asonde/nengajo/nengajo-codeeditor.txt','<!-- wp:html -->\n'+s.trim()+'\n<!-- /wp:html -->\n');
fs.writeFileSync('/tmp/claude-0/-home-user--/ced53b38-cabd-5933-aa16-1ea1fa8a59b8/scratchpad/ngmintest.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+s.replace("/wp-content/uploads/2026/10/","upload/")+'</body></html>');
})();
