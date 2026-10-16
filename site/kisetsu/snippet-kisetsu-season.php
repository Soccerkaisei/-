<?php
/**
 * 季節の演出＋「今月の日本」バッジ（Code Snippets に貼る・「フロントエンドのみ実行」）
 *
 * ・今月の日本バッジ：日本語のページ全部（季節のページ自身は除く）に、左下に小さく表示 → /kisetsu/ へ
 * ・季節の演出（花びら・もみじ・雪）：トップ／あそんでみよう／季節のページだけ
 *     季節のページでは、選んだ季節に合わせて切り替え（春=桜／夏=ホタル／秋=もみじ／冬=雪）
 *     3〜4月 桜、10〜11月 もみじ、12〜2月 雪、それ以外はなし
 * ・月は日本時間で判定（キャッシュされても、表示はブラウザ側で今月に切り替わる）
 * ・「動きを減らす」設定の人には演出を出さない。花びらは押せない（下のボタンはふつうに押せる）
 * ・バッジの × で、そのタブを閉じるまで非表示
 * ・スマホ下の固定ボタン（.tjx-sticky）があるページでは、その上にバッジを出す
 */
add_action('wp_footer', function () {
	if (is_admin()) return;
	if (function_exists('pll_current_language') && pll_current_language() !== 'ja') return;
	$fx = (is_front_page() || is_page(array('asonde', 'kisetsu'))) ? '1' : '0';
	$badge = is_page('kisetsu') ? '0' : '1';
	$sync = is_page('kisetsu') ? '1' : '0';
	$u = '/wp-content/uploads/2026/10/';
	?>
<div id="tjSeason" data-fx="<?php echo $fx; ?>" data-badge="<?php echo $badge; ?>" data-sync="<?php echo $sync; ?>" data-img="<?php echo esc_attr($u); ?>"></div>
<style>
#tjSeasonFx{position:fixed;inset:0;pointer-events:none;z-index:9990;overflow:hidden}
#tjSeasonFx i{position:absolute;top:-40px;display:block;will-change:transform;animation:tjFall linear forwards}
@keyframes tjFall{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(var(--dx),110vh) rotate(var(--r))}}
@keyframes tjRise{0%{transform:translate(0,0);opacity:0}15%{opacity:.9}50%{opacity:.4}70%{opacity:.95}100%{transform:translate(var(--dx),-70vh);opacity:0}}
.tjBadge{position:fixed;left:16px;bottom:16px;z-index:9991;display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;background:#fff;border-radius:999px;box-shadow:0 8px 24px -10px rgba(43,59,66,.45);text-decoration:none!important;color:#2b3b42;font-family:'Zen Maru Gothic','Hiragino Maru Gothic ProN',sans-serif;opacity:0;transform:translateY(10px);transition:opacity .5s,transform .5s,box-shadow .2s;max-width:calc(100vw - 100px)}
.tjBadge.on{opacity:1;transform:none}
.tjBadge:hover{box-shadow:0 12px 28px -10px rgba(43,59,66,.55)}
.tjBadge img{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none}
.tjBadge span{display:block;line-height:1.3;min-width:0}
.tjBadge small{display:block;font-size:11px;font-weight:700;color:var(--tjc,#c4652a);letter-spacing:.04em}
.tjBadge b{display:block;font-size:14px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tjBadge em{font-style:normal;color:var(--tjc,#c4652a);font-weight:900;margin-left:2px}
.tjBadgeX{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:0;background:#2b3b42;color:#fff;font-size:12px;line-height:20px;text-align:center;cursor:pointer;padding:0}
@media (max-width:600px){.tjBadge{left:10px;bottom:10px;padding:4px 12px 4px 4px;gap:8px}.tjBadge img{width:36px;height:36px}.tjBadge b{font-size:13px}}
</style>
<script>
(function(){
var box=document.getElementById("tjSeason");if(!box)return;
var M=new Date(Date.now()+9*36e5).getUTCMonth()+1, IMG=box.getAttribute("data-img");
var D={1:["お正月","ks-osechi","#4f6f96"],2:["節分","ks-setsubun","#4f6f96"],3:["ひなまつり","ks-hina","#c9577a"],4:["お花見","ks-hanami","#c9577a"],5:["こどもの日","ks-kodomo","#c9577a"],6:["梅雨・あじさい","ks-tsuyu","#3a5fb8"],7:["七夕","ks-tanabata","#3a5fb8"],8:["夏祭り・花火","ks-hanabi","#3a5fb8"],9:["お月見","ks-tsukimi","#c4652a"],10:["運動会・秋祭り","ks-undokai","#c4652a"],11:["紅葉・七五三","ks-momiji","#c4652a"],12:["大みそか","ks-nenmatsu","#4f6f96"]}[M];

/* 今月の日本バッジ */
var hidden=false;try{hidden=sessionStorage.getItem("tjBadgeOff")==="1"}catch(e){}
if(box.getAttribute("data-badge")==="1"&&!hidden){
 var a=document.createElement("a");a.className="tjBadge";a.href="/kisetsu/";a.style.setProperty("--tjc",D[2]);
 a.innerHTML='<img src="'+IMG+D[1]+'.webp" alt=""><span><small>'+M+'月の日本</small><b>'+D[0]+'<em>›</em></b></span><button type="button" class="tjBadgeX" aria-label="閉じる">×</button>';
 a.addEventListener("click",function(e){
  if(e.target.className==="tjBadgeX"){e.preventDefault();a.remove();try{sessionStorage.setItem("tjBadgeOff","1")}catch(x){}return}
  if(window.gtag)gtag("event","kisetsu_badge_click",{month:M});
 });
 document.body.appendChild(a);setTimeout(function(){a.classList.add("on")},800);
 function lift(){var st=document.querySelector(".tjx-sticky"),h=(st&&getComputedStyle(st).display!=="none"&&getComputedStyle(st).position==="fixed")?st.offsetHeight:0;a.style.bottom=(h?h+10:(window.innerWidth<600?10:16))+"px"}
 lift();window.addEventListener("resize",lift);
}

/* 季節の演出 */
if(box.getAttribute("data-fx")!=="1")return;
if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var SVG={
 sakura:function(c){return '<svg width="100%" height="100%" viewBox="0 0 20 20"><path d="M10 1C6 5 3 9 5 14c1.5 3.5 5 5 5 5s3.5-1.5 5-5c2-5-1-9-5-13zm0 3l1.5 4H8.5z" fill="'+c+'"/></svg>'},
 momiji:function(c){return '<svg width="100%" height="100%" viewBox="0 0 24 26"><path d="M9.8 7.5 L9.6 4.0 L10.6 5.2 L10.9 2.4 L12.0 1.5 L13.1 2.4 L13.4 5.2 L14.4 4.0 L14.2 7.5 L13.8 9.0 L14.7 8.0 L17.3 6.0 L16.9 7.4 L19.3 6.2 L20.6 6.5 L20.4 7.8 L18.5 9.6 L19.9 9.8 L17.1 11.5 L16.0 12.5 L17.1 13.5 L19.9 15.2 L18.5 15.4 L20.4 17.2 L20.6 18.5 L19.3 18.8 L16.9 17.6 L17.3 19.0 L14.7 17.0 L12.0 16.5 L10.0 15.9 L8.0 17.4 L8.3 16.4 L6.5 17.3 L5.5 17.0 L5.6 16.0 L7.1 14.7 L6.0 14.6 L8.1 13.3 L8.0 12.5 L8.1 11.7 L6.0 10.4 L7.1 10.3 L5.6 9.0 L5.5 8.0 L6.5 7.7 L8.3 8.6 L8.0 7.6 L10.0 9.1 L10.2 9.0Z" fill="'+c+'"/><path d="M12 15.5v7.5" stroke="'+c+'" stroke-width="1.4" stroke-linecap="round"/></svg>'},
 yuki:function(c){return '<svg width="100%" height="100%" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.2" fill="'+c+'"/></svg>'},
 hotaru:function(c){return '<svg width="100%" height="100%" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="'+c+'"/></svg>'}
};
var COL={sakura:["#f6b8c8","#f9cdd8","#f2a3b8"],momiji:["#d9472b","#e8742c","#f0a530","#c7362a"],yuki:["#ffffff","#eef4fb","#dfe9f5"],hotaru:["#f6f3a0","#e9f58a","#fff6b0"]};
var fx=null,timer=null,endT=null;
function run(kind){
 clearInterval(timer);clearTimeout(endT);
 if(fx)fx.innerHTML="";else{fx=document.createElement("div");fx.id="tjSeasonFx";fx.setAttribute("aria-hidden","true");document.body.appendChild(fx)}
 if(!kind)return;
 var n=0,MAX=window.innerWidth<600?10:16;
 function one(){
  var i=document.createElement("i"),up=kind==="hotaru",
   s=kind==="yuki"?6+Math.random()*7:kind==="momiji"?16+Math.random()*12:up?7+Math.random()*5:12+Math.random()*8,
   dur=up?8+Math.random()*5:9+Math.random()*6;
  i.style.cssText="left:"+(Math.random()*100)+"vw;width:"+s+"px;height:"+s+"px;animation-duration:"+dur+"s;--dx:"+((Math.random()-.5)*(up?14:30))+"vw;--r:"+((kind==="yuki"||up)?0:(Math.random()*720-360))+"deg;opacity:"+(kind==="yuki"?.95:.85)
   +(kind==="yuki"?";filter:drop-shadow(0 0 2px rgba(80,110,150,.45))":"")
   +(up?";top:auto;bottom:-30px;animation-name:tjRise;filter:drop-shadow(0 0 6px rgba(240,240,120,.95))":"");
  i.innerHTML=SVG[kind](COL[kind][Math.floor(Math.random()*COL[kind].length)]);
  fx.appendChild(i);setTimeout(function(){i.remove()},dur*1000+200);
 }
 timer=setInterval(function(){one();if(++n>=MAX)clearInterval(timer)},700);
}
if(box.getAttribute("data-sync")==="1"){
 /* 季節のページ：選んだ季節に合わせる（春=桜／夏=ホタル／秋=もみじ／冬=雪） */
 var MAP={spring:"sakura",summer:"hotaru",autumn:"momiji",winter:"yuki"},root=document.querySelector(".ks-root")||document.body,last="";
 var sync=function(){var k=MAP[root.getAttribute("data-ks")]||"";if(k&&k!==last){last=k;run(k)}};
 sync();new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:["data-ks"]});
}else{
 run((M===3||M===4)?"sakura":(M===10||M===11)?"momiji":(M===12||M<=2)?"yuki":"");
}
})();
</script>
<?php
});
