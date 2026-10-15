// 季節ショート動画の書き出し
//   node video/kisetsu-short/render.js [2026-11]          … 本編（30秒）＋ストーリーズ用2本
//   node video/kisetsu-short/render.js 2026-11 --stills   … 確認用の静止画だけ
// 必要：playwright（Chromium）、ffmpeg、python3(numpy)
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, execFileSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../..");
const HERE = __dirname;
const month = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "2026-11";
const STILLS = process.argv.includes("--stills");
const FPS = 30, DUR = 30, SPLIT = 15;
const OUT = path.join(HERE, "out", month);
fs.mkdirSync(OUT, { recursive: true });

// フォント（Zen Maru Gothic / SIL OFL）が無ければ取得
const FONT_DIR = path.join(HERE, "fonts");
fs.mkdirSync(FONT_DIR, { recursive: true });
for (const w of ["Medium", "Bold", "Black"]) {
  const f = path.join(FONT_DIR, `ZenMaruGothic-${w}.ttf`);
  if (!fs.existsSync(f)) execFileSync("curl", ["-sSL", "-o", f, `https://raw.githubusercontent.com/google/fonts/main/ofl/zenmarugothic/ZenMaruGothic-${w}.ttf`]);
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ttf": "font/ttf" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});

function run(cmd, args) {
  return new Promise((ok, ng) => { const p = spawn(cmd, args, { stdio: "inherit" }); p.on("exit", c => c ? ng(new Error(cmd + " " + c)) : ok()); });
}

(async () => {
  await new Promise(r => server.listen(0, r));
  const url = `http://127.0.0.1:${server.address().port}/video/kisetsu-short/render.html?month=${month}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 720 } });
  page.on("pageerror", e => console.error("pageerror:", e));
  await page.goto(url);
  await page.evaluate(() => window.ready);
  const grab = t => page.evaluate(t => { window.render(t); return document.getElementById("c").toDataURL("image/jpeg", 0.95).split(",")[1]; }, t);

  // 確認用の静止画（各シーンの見どころ）
  const stills = { "1-hook": 3.2, "2a-momiji": 5.2, "2b-icho": 6.9, "2c-chitoseame": 8.5, "3-words": 14.2, "4-metaverse": 19.0, "5-event": 24.0, "6-outro": 29.0 };
  for (const [k, t] of Object.entries(stills)) fs.writeFileSync(path.join(OUT, `still-${k}.jpg`), Buffer.from(await grab(t), "base64"));
  const sfx = await page.evaluate(() => window.SFX);
  fs.writeFileSync(path.join(OUT, "sfx.json"), JSON.stringify(sfx));
  if (STILLS) { await browser.close(); server.close(); return; }

  // BGM（自作の合成音源なので著作権フリー）
  await run("python3", [path.join(HERE, "bgm.py"), path.join(OUT, "sfx.json"), path.join(OUT, "bgm.wav")]);

  const video = path.join(OUT, `kisetsu-${month}.mp4`);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-i", path.join(OUT, "bgm.wav"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS),
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", video], { stdio: ["pipe", "inherit", "inherit"] });
  const total = FPS * DUR;
  for (let f = 0; f < total; f++) {
    const buf = Buffer.from(await grab(f / FPS), "base64");
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 60 === 0) process.stdout.write(`\rframe ${f}/${total}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("exit", r));
  console.log("\n->", video);
  await browser.close(); server.close();

  // ストーリーズ用 15秒×2（区切り位置は必ずシーンの切れ目）
  const enc = ["-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart"];
  await run("ffmpeg", ["-y", "-loglevel", "error", "-i", video, "-t", String(SPLIT), "-af", `afade=t=out:st=${SPLIT - 0.6}:d=0.6`, ...enc, path.join(OUT, `kisetsu-${month}-story1.mp4`)]);
  await run("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(SPLIT), "-i", video, "-t", String(DUR - SPLIT), "-af", "afade=t=in:st=0:d=0.3", ...enc, path.join(OUT, `kisetsu-${month}-story2.mp4`)]);
  console.log("-> story1 / story2");
})().catch(e => { console.error(e); process.exit(1); });
