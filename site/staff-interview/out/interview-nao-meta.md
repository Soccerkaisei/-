# 山﨑 尚子さん（なお） インタビュー記事（10/21なお）

| 項目 | 内容 |
|---|---|
| タイトル（36字） | 「できない」の先にある「やってみたい」を。子どもの歩幅で共に未来を探す。 |
| スラッグ | `interview-nao` → https://nijin.co.jp/recruit/interview-nao/ |
| メタディスクリプション（127字） | 塾講師として30年以上子どもたちと向き合い、我が子の不登校も経験した山﨑尚子さん。NIJINアカデミー京都金閣寺校の教室長として、「選べる」ことを大切にした居場所づくりに挑んでいます。子どもの「やってみたい」を支える仕事とやりがいを語るインタビューです。 |
| カテゴリ | スタッフインタビュー ＞ リアル教室 |
| アイキャッチ | `nao-eyecatch.png`（一覧カードと共通。ちひろさんと同様に作成） |
| 本文 | `out/interview-nao.html` を「カスタムHTML」ブロックに貼り付け |

## 要確認・メモ

- 写真フォルダ（スタッフインタビュー写真）に「なお」のフォルダがまだありません。写真6枚ほどの提出をお願いする（プロフィール用1枚＋本文用3枚＋CTA背景）。
- 「やりがい」の回答冒頭の文が「〜では、〜点にもあります」とねじれていたため「NIJINアカデミーでの難しさは、〜点にもあります」に整えています。
- 🎬 京都金閣寺校のYouTube動画URLが未設定（build.py の youtube=dict(id=...) に動画IDを入れると、1問目の後にMOVIEカードが入る）。

## スタッフ一覧（/recruit/staff/）に追加するカード

インタビューカード一覧（`#interviewCardList`）の先頭に追加：

```html
  <!-- 山﨑 尚子さん（なお） -->
  <a href="https://nijin.co.jp/recruit/interview-nao/" class="employee-card" data-major="teacher" data-minor="リアル教室長">
    <div class="card-label">リアル教室長</div>
    <div class="img-wrapper"><img src="https://nijin.co.jp/recruit/wp-content/uploads/2026/11/nao-eyecatch.png" alt="山﨑尚子（なお）さん"></div>
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
