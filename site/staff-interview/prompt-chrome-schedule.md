あなたはNIJIN採用サイト（WordPress：https://nijin.co.jp/recruit/wp-admin/）で、スタッフインタビュー記事を3本作成して公開・予約するアシスタントです。私はすでにログインしています。以下の手順で1本ずつ進めてください。

## 作る記事

| # | 公開日時 | スラッグ | タイトル | アイキャッチ画像 |
|---|---|---|---|---|
| 1 | 2026/10/21（今日）→ **今すぐ公開** | interview-nao | 「できない」の先にある「やってみたい」を。子どもの歩幅で共に未来を探す。 | nao-eyecatch |
| 2 | 2026/11/4 7:00 → **予約投稿** | interview-tomo | 「夢中力」で未来を切り拓く｜日本画家が青森にリアル校を開く理由 | tomo-eyecatch |
| 3 | 2026/11/25 7:00 → **予約投稿** | interview-marino | ダンスで子どもの自信を育てる｜プロダンサーがNIJINの教室長に | 「青　グラデーション　美しい　化粧品　美容　Instagramストーリーのコピー - 2」という名前の画像（キャップをかぶった女性） |

本文HTML（この中身をそのまま本文にします。編集しないでください）：
- 1: https://raw.githubusercontent.com/soccerkaisei/-/ced4eb120d091fc824799778bebd373e7feade24/site/staff-interview/out/interview-nao.html
- 2: https://raw.githubusercontent.com/soccerkaisei/-/ced4eb120d091fc824799778bebd373e7feade24/site/staff-interview/out/interview-tomo.html
- 3: https://raw.githubusercontent.com/soccerkaisei/-/ced4eb120d091fc824799778bebd373e7feade24/site/staff-interview/out/interview-marino.html

メタディスクリプション：
- 1: 塾講師として30年以上子どもたちと向き合い、我が子の不登校も経験した山﨑尚子さん。NIJINアカデミー京都金閣寺校の教室長として、「選べる」ことを大切にした居場所づくりに挑んでいます。子どもの「やってみたい」を支える仕事とやりがいを語るインタビューです。
- 2: 青森県で15年にわたり美術教育に携わってきた日本画家・佐伯知美さん。「学校が苦痛だった」自身の経験と、親になって生まれた思いから、NIJINアカデミー青森十和田校の開校を決意。子どもの「夢中力」を引き出す教育と、NIJINで挑む新しい学びを語るインタビューです。
- 3: 台湾のダンスコンテスト「OSTA」優勝の実績を持つプロダンサーで、アパレルブランド「cLLe」も手がける岡野真梨乃さん。「ダンス×教育」への想いからNIJINに参画し、新神戸校の教室長とSNS・採用担当として挑戦の毎日を送っています。失敗を恐れず挑戦できる文化と、チームで働く難しさ・やりがいを語るインタビューです。

カテゴリ（3本とも）：「スタッフインタビュー」と、その子カテゴリ「リアル教室」の2つにチェック。
（見本：https://nijin.co.jp/recruit/interview-chihiro/ と同じカテゴリです）

## 手順（1本ずつ）

1. 「投稿」→「新規投稿」を開く（ブロックエディタ）。
2. 本文HTMLを取り込む。ページ上のJavaScriptで次を実行すると確実です：
   ```js
   const html = await (await fetch('（上の本文HTMLのURL）')).text();
   ```
3. 画像URLの確認（重要）：
   - HTML内の `https://nijin.co.jp/recruit/wp-content/uploads/2026/10/〜` の画像URLについて、メディアライブラリの実際の「ファイルのURL」と一致しているか確認する（`wp.apiFetch({path:'/wp/v2/media?search=ファイル名'})` の `source_url` で確認できます）。
   - 違っていたら、HTML内のURLをメディアの実際のURLに置き換える（例：`IMG_5720-scaled.jpg` が実際は `IMG_5720.jpg` だった、など）。
   - 記事3（マリノ）は、HTML内の `__MARINO_COVER_URL__`（2か所：プロフィール写真）を、表の「青　グラデーション…」画像の実際のURLに置き換える。
4. 置き換えたHTMLを「カスタムHTML」ブロック1つとして本文に入れる：
   ```js
   wp.data.dispatch('core/block-editor').resetBlocks([wp.blocks.createBlock('core/html', { content: html })]);
   ```
5. タイトル・スラッグを設定：
   ```js
   wp.data.dispatch('core/editor').editPost({ title: '（タイトル）', slug: '（スラッグ）' });
   ```
6. 右サイドバーで設定：
   - カテゴリ：「スタッフインタビュー」「リアル教室」にチェック（ほかのチェックは外す）
   - アイキャッチ画像：表の画像を選ぶ
   - メタディスクリプション：SEOプラグインの欄に上の文章を入れる
7. プレビューで確認：写真が全部表示されているか（灰色の箱や壊れた画像がないか）、最後の募集ボタンの背景に写真が出ているか。
8. 公開／予約：
   - 記事1：そのまま「公開」
   - 記事2・3：「公開」の日時を表の日時に変更して「予約投稿」
9. 次の記事へ。

## 終わったら報告してほしいこと
- 3本それぞれの状態（公開済み／予約済みと日時）と編集画面のURL
- 置き換えた画像URLがあれば、元のURL → 新しいURL
- 表示がおかしかったところ

## やらないこと
- 本文の文章やデザイン（HTML）は変更しない（画像URLの置き換えだけOK）
- スタッフ一覧ページ（/recruit/staff/）はまだ触らない（一覧カードは公開日に別で追加します）
- 迷ったら、作業を止めて私に聞いてください
