<?php
/**
 * 先生ページ：自己紹介動画のすぐ下に「〇〇先生と、無料で話してみる」ボタンを足す
 * （Code Snippets に貼る・「フロントエンドのみ実行」）
 *
 * ・/teachers/〇〇/ のページだけで動く
 * ・YouTube の動画と、予約コーナー（#taiken）の両方があるページにだけ出る（動画がない先生には出ない）
 * ・先生の名前は、上の「〇〇先生の無料体験に申し込む」ボタンから自動で取る
 * ・押した回数は GA4 に teacher_video_cta_click（teacher=ページ名）で記録
 */
add_action('wp_footer', function () {
	if (is_admin()) return;
	$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
	if (!preg_match('#^/teachers/[^/]+/?$#', (string) $path)) return;
	?>
<style>
.tjVideoCta{margin:26px 0 0;text-align:center}
.tjVideoCta small{display:block;margin-top:10px;font-size:.85rem;color:var(--tjx-soft,#6b7b80)}
</style>
<script>
(function(){
var ifr=document.querySelector('iframe[src*="youtube.com/embed"],iframe[src*="youtube-nocookie.com/embed"]'),taiken=document.getElementById("taiken");
if(!ifr||!taiken||document.querySelector(".tjVideoCta"))return;
var name="この先生",hero=document.querySelector('a[href="#taiken"]');
if(hero){var m=hero.textContent.match(/(\S+?先生)の/);if(m)name=m[1]}
var box=document.createElement("div");box.className="tjVideoCta";
box.innerHTML='<a class="tjx-btn tjx-btn-primary" href="#taiken">'+name+'と、無料で話してみる →</a><small>オンライン・無料。ご希望の日時を選ぶだけです。</small>';
var wrap=ifr.parentElement;
(wrap&&wrap!==document.body?wrap:ifr).insertAdjacentElement("afterend",box);
box.querySelector("a").addEventListener("click",function(){
 if(window.gtag)gtag("event","teacher_video_cta_click",{teacher:location.pathname.split("/")[2]||""});
});
})();
</script>
<?php
});
