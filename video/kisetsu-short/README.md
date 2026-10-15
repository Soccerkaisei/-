# 季節ショート動画（Instagramストーリーズ／YouTubeショート／TikTok）

ともだちじゃぱん向けの縦型ショート動画（1080×1920、30秒、15秒×2本に分割可）を、コードから書き出すしくみ。

## 毎月の作り方

1. `months/2026-11.js` をコピーして `months/YYYY-MM.js` を作り、**このファイルだけ**を書きかえる
   （月・色・舞うもの・写真・6シーンのテキスト・イベント名）
2. 書き出し：
   ```
   node video/kisetsu-short/render.js YYYY-MM            # 本編＋ストーリーズ2本
   node video/kisetsu-short/render.js YYYY-MM --stills   # 確認用の静止画だけ
   ```
3. `out/YYYY-MM/` に以下ができる
   - `kisetsu-YYYY-MM.mp4`（本編30秒）
   - `kisetsu-YYYY-MM-story1.mp4` / `-story2.mp4`（15秒ずつ）
   - `still-*.jpg`（各シーンの確認用の静止画）
4. 投稿用テキストは `out/YYYY-MM/post.md` に書く

ブラウザで `render.html?month=YYYY-MM&safe` を開くと、スライダーで動きを確認できる（`&safe` を付けると上下120pxのNGゾーンが赤く表示される）。

## ルール（レンダラーに組みこみ済み）

- 上下120pxには文字を置かない（`SAFE`）
- 15秒の位置はクロスフェードしない（`SPLIT`）。シーンは必ず15.0秒で切りかわるように設定する
- メタバース・アバターのイメージ映像には「※イメージ」を表示する
- イベントは「開校後に予定」と書く（2026年12月開校）

## 必要なもの

- Node.js＋Playwright（Chromium）、ffmpeg、Python 3（numpy）
- フォント：Zen Maru Gothic（SIL Open Font License）。`fonts/` が空なら render.js が自動でダウンロードする
- BGM：`bgm.py` で毎回合成する（自作の音源なので著作権フリー）
