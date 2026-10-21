# 岡野 真梨乃さん（マリノ） インタビュー記事（11/25マリノ）

| 項目 | 内容 |
|---|---|
| タイトル（32字） | ダンスで子どもの自信を育てる｜プロダンサーがNIJINの教室長に |
| スラッグ | `interview-marino` → https://nijin.co.jp/recruit/interview-marino/ |
| メタディスクリプション（159字） | 台湾のダンスコンテスト「OSTA」優勝の実績を持つプロダンサーで、アパレルブランド「cLLe」も手がける岡野真梨乃さん。「ダンス×教育」への想いからNIJINに参画し、新神戸校の教室長とSNSマネージャーとして挑戦の毎日を送っています。失敗を恐れず挑戦できる文化と、チームで働く難しさ・やりがいを語るインタビューです。 |
| カテゴリ | スタッフインタビュー ＞ リアル教室 |
| アイキャッチ | `__MARINO_COVER_URL__`（一覧カードと共通。プロフィール写真を4:3に切り抜き。写真がない人は要作成） |
| 本文 | `out/interview-marino.html` を「カスタムHTML」ブロックに貼り付け |

## 要確認・メモ

- キャッチコピーが未記入のため、Instagram投稿の表紙コピー「ダンスで子どもの自信を育てる」を使ったタイトルにしています。
- 経歴が610字と長いため、ちひろさん記事と同様にリード文2段落に要約しています（OSTA優勝・cLLe・ダンス×教育・SNSマネージャーを残す）。
- 経歴の「神戸市のフリースクール」はリアル校と確認済み。採用サイトのリアル教室長ページに「新神戸校でダンスをする子どもたち」の写真があるため、校舎名を「新神戸校」としています（念のため確認）。
- 写真はInstagram投稿の6枚（WordPressメディアにアップロード済み）。表紙写真のURLは本文内の __MARINO_COVER_URL__ をメディアの「ファイルのURL」に置き換える。IMG_5720・IMG_5726は大きいので、WordPressが自動で「-scaled」付きのURLにしている想定。違っていたらメディアのURLに合わせる。
- Instagram投稿では肩書きが「リアル教室長(新神戸校)/SNS・採用担当」なので、タグと一覧カードをそれに合わせています。

## スタッフ一覧（/recruit/staff/）に追加するカード

インタビューカード一覧（`#interviewCardList`）の先頭に追加：

```html
  <!-- 岡野 真梨乃さん（マリノ） -->
  <a href="https://nijin.co.jp/recruit/interview-marino/" class="employee-card" data-major="teacher" data-minor="リアル教室長">
    <div class="card-label">リアル教室長</div>
    <div class="img-wrapper"><img src="__MARINO_COVER_URL__" alt="岡野真梨乃（マリノ）さん"></div>
    <div class="card-content">
      <h3 class="card-title">ダンスで子どもの自信を育てる｜プロダンサーがNIJINの教室長に</h3>
      <div class="card-meta">
        <p class="meta-item">新神戸校 教室長</p>
        <p class="meta-item">SNS・採用担当</p>
        <p class="meta-name"><strong>岡野 真梨乃さん（マリノ）</strong></p>
        <p class="meta-age">30代</p>
      </div>
    </div>
  </a>
```
