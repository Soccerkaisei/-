WordPress（https://nijin.co.jp/recruit/wp-admin/）で、次の2つの作業をしてください。私はログイン済みです。本文や、ここに書いていない設定は変更しないでください。

## 作業1：スタッフ一覧ページになおさんのカードを追加

1. 「固定ページ」から、URLが https://nijin.co.jp/recruit/staff/ のページを編集で開く。
2. 本文HTMLの中の `<div class="employee-card-list" id="interviewCardList">` を探す。
3. そのすぐ下、`<!-- ちひろさん（進藤） -->` のカードより前（＝いちばん上）に、下のHTMLをそのまま追加する。
4. 「更新」する。

```html
  <!-- 山﨑 尚子さん（なお） -->
  <a href="https://nijin.co.jp/recruit/interview-nao/" class="employee-card" data-major="teacher" data-minor="リアル教室長">
    <div class="card-label">リアル教室長</div>
    <div class="img-wrapper"><img src="https://nijin.co.jp/recruit/wp-content/uploads/2026/10/nao-eyecatch.jpg" alt="山﨑尚子（なお）さん"></div>
    <div class="card-content">
      <h3 class="card-title">「できない」の先にある「やってみたい」を。子どもの歩幅で共に未来を探す。</h3>
      <div class="card-meta">
        <p class="meta-item">京都金閣寺校 教室長</p>
        <p class="meta-item">不登校の中学生の学習サポート</p>
        <p class="meta-name"><strong>山﨑 尚子さん（なお）</strong></p>
      </div>
    </div>
  </a>
```

※トモさん・マリノさんの記事はまだ予約中なので、カードは追加しないでください。

## 作業2：3本の記事にYoast SEOの「SEOタイトル」と「フォーカスキーフレーズ」を入れる

| 記事 | SEOタイトル | フォーカスキーフレーズ |
|---|---|---|
| interview-nao（公開済み） | 不登校の子の居場所をつくる｜塾講師30年の京都の教室長インタビュー | 不登校 居場所 |
| interview-tomo（11/4 予約中） | 日本画家が青森でフリースクール開校｜美術教育15年の教室長インタビュー | フリースクール 開校 |
| interview-marino（11/25 予約中） | プロダンサーがNIJINの教室長に｜ダンス×教育で子どもの自信を育てる | ダンス 教育 |

1本ずつ：
1. 「投稿」一覧から記事を編集で開く（予約中の2本は「予約済み」で絞り込むと見つかります）。
2. Yoast SEOの欄で、
   - 「フォーカスキーフレーズ」に上のキーフレーズを入れる
   - 「SEOタイトル」の中身（「タイトル」「区切り」「サイトタイトル」などの変数）を全部消して、上のSEOタイトルの文字だけにする
   - メタディスクリプションが空になっていないか確認する（空なら私に報告）
3. 公開済みの記事は「更新」、予約中の記事は「予約を更新」（公開日時は変えない）。

## 終わったら確認・報告してほしいこと
- https://nijin.co.jp/recruit/staff/ の
  - いちばん上になおさんのカードが出ているか
  - 件数が「すべて(28)」「NIJINアカデミーの先生たち(19)」に増えているか
  - カードを押すと https://nijin.co.jp/recruit/interview-nao/ が開くか
- 3本それぞれ、SEOタイトルとキーフレーズを入れたか、予約日時が変わっていないか
- https://nijin.co.jp/recruit/interview-nao/ を開いて、ブラウザのタブのタイトルが上のSEOタイトルになっているか

迷ったら作業を止めて私に聞いてください。
