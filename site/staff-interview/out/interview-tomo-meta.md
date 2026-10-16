# 佐伯 知美さん（トモちゃん） インタビュー記事（11/4トモちゃん）

| 項目 | 内容 |
|---|---|
| タイトル（31字） | 「夢中力」で未来を切り拓く｜日本画家が青森にリアル校を開く理由 |
| スラッグ | `interview-tomo` → https://nijin.co.jp/recruit/interview-tomo/ |
| メタディスクリプション（131字） | 青森県で15年にわたり美術教育に携わってきた日本画家・佐伯知美さん。「学校が苦痛だった」自身の経験と、親になって生まれた思いから、NIJINアカデミー青森十和田校の開校を決意。子どもの「夢中力」を引き出す教育と、NIJINで挑む新しい学びを語るインタビューです。 |
| カテゴリ | スタッフインタビュー ＞ リアル教室 |
| アイキャッチ | `tomo-eyecatch.png`（一覧カードと共通。ちひろさんと同様に作成） |
| 本文 | `out/interview-tomo.html` を「カスタムHTML」ブロックに貼り付け |

## 要確認・メモ

- キャッチコピーの記入が「「夢中力」で未来を切り拓く力を」（15字）と規定（28〜40字）より短いため、ちひろさん記事と同じ「〇〇｜〇〇」型で31字に整えた案をタイトルにしています。
- 写真はDriveの「トモちゃん」フォルダの6枚を使用（img/tomo/ に縮小済み）。WordPressのメディアに同名でアップロードし、URLが https://nijin.co.jp/recruit/wp-content/uploads/2026/11/ と違う場合は本文内のURLを置き換えてください。
- 家族写真（tomo-family.jpg）に赤ちゃんの顔が写っています。掲載してよいか本人に念のため確認。
- エピソード欄の末尾「とても大きな影響でし)」は「とても大きな影響でした。」に直しています。
- 🎬 青森十和田校のYouTube動画URLが未設定（build.py の youtube=dict(id=...) に動画IDを入れると、1問目の後にMOVIEカードが入る）。

## スタッフ一覧（/recruit/staff/）に追加するカード

インタビューカード一覧（`#interviewCardList`）の先頭に追加：

```html
  <!-- 佐伯 知美さん（トモちゃん） -->
  <a href="https://nijin.co.jp/recruit/interview-tomo/" class="employee-card" data-major="teacher" data-minor="リアル教室長">
    <div class="card-label">リアル教室長</div>
    <div class="img-wrapper"><img src="https://nijin.co.jp/recruit/wp-content/uploads/2026/11/tomo-eyecatch.png" alt="佐伯知美（トモちゃん）さん"></div>
    <div class="card-content">
      <h3 class="card-title">「夢中力」で未来を切り拓く｜日本画家が青森にリアル校を開く理由</h3>
      <div class="card-meta">
        <p class="meta-item">青森十和田校 教室長</p>
        <p class="meta-item">スクール実minori 代表</p>
        <p class="meta-name"><strong>佐伯 知美さん（トモちゃん）</strong></p>
        <p class="meta-age">40代</p>
      </div>
    </div>
  </a>
```
