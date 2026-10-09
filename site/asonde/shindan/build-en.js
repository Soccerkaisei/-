const fs=require('fs');const {minify}=require('terser');
(async()=>{
const D='/home/user/-/site/asonde/shindan/';
let s=fs.readFileSync(D+'shindan-en.html','utf8');
s=s.replace(/<style>([\s\S]*?)<\/style>/g,(m,c)=>'<style>'+c.replace(/\/\*[\s\S]*?\*\//g,'').split('\n').map(l=>l.trim()).filter(Boolean).join('')+'</style>');
const m=s.match(/<script>([\s\S]*?)<\/script>/);
const r=await minify(m[1],{compress:true,mangle:true,format:{ascii_only:false,max_line_len:false}});
const b64=Buffer.from(r.code,'utf8').toString('base64');
s=s.replace(m[0],'<script>(function(d){var s=d.createElement("script");s.text=new TextDecoder().decode(Uint8Array.from(atob("'+b64+'"),function(c){return c.charCodeAt(0)}));d.body.appendChild(s)})(document)</script>');
s=s.split('\n').filter(l=>l.trim()).join('\n');
fs.writeFileSync(D+'shindan-en-codeeditor.txt','<!-- wp:html -->\n'+s.trim()+'\n<!-- /wp:html -->\n');
fs.writeFileSync(process.argv[2],'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0">'+s+'</body></html>');
})();
