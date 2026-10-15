// ============================================================
// 【今月の設定】毎月このファイルだけ入れかえる（コピーして YYYY-MM.js を作る）
// 季節ショート動画（9:16 / 30秒 / 15秒×2に分割可）
// ============================================================
window.MONTH = {
  id: "2026-11",
  month: "11月",
  season: "autumn",

  // 季節の色（背景グラデーション・アクセント）
  colors: {
    bgTop: "#e98b3a", bgMid: "#f6b866", bgBottom: "#fde3b8",
    accent: "#c4652a", red: "#d9472b", orange: "#ee8a2e", yellow: "#f2c230",
    ink: "#2b3b42", cream: "#fff8ec"
  },

  // 舞うもの（"momiji" | "icho" | "sakura" | "snow" などを renderer 側で描画）
  particles: ["momiji", "icho"],

  // 写真（assets/ からの相対パス）。null のものはイラストで代用
  photos: {
    hook: "../../site/kisetsu/img/ks-autumn.webp",     // ① つかみ：ズームインする写真
    focusX: 0.36,                                       // 縦切り抜きの横位置（0=左, 1=右）
    slides: [                                           // ② 順番に切りかわる写真
      { src: "../../site/kisetsu/img/ks-momiji.webp", focusX: 0.55, label: "もみじ" },
      { src: "../../site/kisetsu/img/ks-icho.webp", focusX: 0.28, label: "いちょう" },
      { src: null, draw: "chitoseame", label: "ちとせあめ" } // ← 七五三の写真が届いたら src に入れる
    ],
    metaverse: null // ← メタバース校舎のスクリーンショットが届いたら入れる（null の間はイラスト）
  },

  // 6シーンのテキスト（日本語は大きく、英語は小さく）
  // ※ストーリーズ用に 15.0 秒で必ずシーンが切りかわるようにする
  scenes: [
    { id: "hook", from: 0, to: 4,
      ja: ["11月の日本は、", "紅葉の季節🍁"],
      en: "November in Japan — the season of autumn leaves" },
    { id: "slides", from: 4, to: 9,
      ja: ["赤いもみじ、", "黄色いいちょう。", "七五三のお祝いも。"],
      en: "Red maple, yellow ginkgo, and Shichi-Go-San" },
    { id: "words", from: 9, to: 15,
      ja: ["こんな“秋のことば”、", "知ってる？"],
      en: "Do you know these autumn words?",
      words: [
        { ja: "もみじ", en: "maple leaves", color: "red" },
        { ja: "いちょう", en: "ginkgo", color: "yellow" },
        { ja: "もみじがり", en: "autumn-leaf viewing", color: "orange" },
        { ja: "ちとせあめ", en: "Shichi-Go-San candy", color: "red" }
      ] },
    { id: "metaverse", from: 15, to: 20,
      ja: ["メタバースの校舎でも、", "秋を感じよう"],
      note: "※イメージ",
      en: "Feel autumn in our metaverse school, too" },
    { id: "event", from: 20, to: 25,
      ja: ["開校後は、ともだちと", "秋のイベントを", "予定しています"],
      note: "※イメージ（2026年12月開校）",
      en: "Seasonal events with friends — coming after we open" },
    { id: "outro", from: 25, to: 30,
      ja: ["海外にいても、", "日本の四季を、", "ともだちと。"],
      brand: "ともだちじゃぱん",
      small: "プロフィールのリンクから、季節のカレンダーを見てね",
      en: "Japanese seasons with friends, wherever you live." }
  ],

  // メタバースで予定しているイベント（⑤のアバター画面に表示）
  eventTitle: "「秋のことば」をあつめよう",
  eventWords: ["まっか", "きいろ", "ひらひら", "ふかふか"]
};
