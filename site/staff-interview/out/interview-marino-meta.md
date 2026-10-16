# 岡野 真梨乃さん（マリノ） インタビュー記事（11/25マリノ）

| 項目 | 内容 |
|---|---|
| タイトル（36字） | プロダンサーがNIJINのSNSマネージャーに｜失敗を恐れない挑戦の毎日 |
| スラッグ | `interview-marino` → https://nijin.co.jp/recruit/interview-marino/ |
| メタディスクリプション（159字） | 台湾のダンスコンテスト「OSTA」優勝の実績を持つプロダンサーで、アパレルブランド「cLLe」も手がける岡野真梨乃さん。「ダンス×教育」への想いからNIJINに参画し、新神戸校の教室長とSNSマネージャーとして挑戦の毎日を送っています。失敗を恐れず挑戦できる文化と、チームで働く難しさ・やりがいを語るインタビューです。 |
| カテゴリ | スタッフインタビュー ＞ リアル教室 |
| アイキャッチ | `marino-eyecatch.png`（一覧カードと共通。ちひろさんと同様に作成） |
| 本文 | `out/interview-marino.html` を「カスタムHTML」ブロックに貼り付け |

## 要確認・メモ

- キャッチコピーが未記入のため、ちひろさん記事と同じ「〇〇｜〇〇」型で36字のタイトル案を作成。本人に確認してください。
- 写真フォルダ（スタッフインタビュー写真）に「マリノ」のフォルダがまだありません。ダンス指導中・作業中・笑顔など6枚ほどの提出をお願いする。
- 経歴が610字と長いため、ちひろさん記事と同様にリード文2段落に要約しています（OSTA優勝・cLLe・ダンス×教育・SNSマネージャーを残す）。
- 経歴の「神戸市のフリースクール」はリアル校と確認済み。採用サイトのリアル教室長ページに「新神戸校でダンスをする子どもたち」の写真があるため、校舎名を「新神戸校」としています（念のため確認）。
- その写真（/uploads/2026/05/リアル-新神戸-768x768.jpg）を本文1枚目とCTA背景に使っています。本人の写真が届いたら差し替え可。

## スタッフ一覧（/recruit/staff/）に追加するカード

インタビューカード一覧（`#interviewCardList`）の先頭に追加：

```html
  <!-- 岡野 真梨乃さん（マリノ） -->
  <a href="https://nijin.co.jp/recruit/interview-marino/" class="employee-card" data-major="teacher" data-minor="リアル教室長">
    <div class="card-label">リアル教室長</div>
    <div class="img-wrapper"><img src="https://nijin.co.jp/recruit/wp-content/uploads/2026/11/marino-eyecatch.png" alt="岡野真梨乃（マリノ）さん"></div>
    <div class="card-content">
      <h3 class="card-title">プロダンサーがNIJINのSNSマネージャーに｜失敗を恐れない挑戦の毎日</h3>
      <div class="card-meta">
        <p class="meta-item">新神戸校 教室長</p>
        <p class="meta-item">SNSマネージャー</p>
        <p class="meta-name"><strong>岡野 真梨乃さん（マリノ）</strong></p>
        <p class="meta-age">30代</p>
      </div>
    </div>
  </a>
```
