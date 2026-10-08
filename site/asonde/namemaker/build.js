const fs=require('fs');const {minify}=require('terser');
(async()=>{
const D='/home/user/-/site/asonde/namemaker/';
let s=fs.readFileSync(D+'namemaker.html','utf8');
s=s.replace(/<style>([\s\S]*?)<\/style>/g,(m,c)=>'<style>'+c.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').map(l=>l.trim()).filter(Boolean).join('')+'</style>');
const m=s.match(/<script>([\s\S]*?)<\/script>/);
const r=await minify(m[1],{compress:true,mangle:true,format:{ascii_only:false,max_line_len:false}});
s=s.replace(m[0],'<script>'+r.code+'</script>');
s=s.split('\n').filter(l=>l.trim()).join('\n');
fs.writeFileSync(D+'namemaker-codeeditor.txt','<!-- wp:html -->\n'+s.trim()+'\n<!-- /wp:html -->\n');
fs.writeFileSync(process.argv[2],'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+s+'</body></html>');
})();
