// ---------------- レポート用の部品 ----------------

function loadGsc_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hist = null, daily = [], rows = [], seen = {};
  ss.getSheets().forEach(function (s) {
    var n = s.getName();
    if (/^\d{4}-\d{2}-\d{2}$/.test(n)) daily.push(s);
    else if (/^SAS_/.test(n) && (!hist || s.getLastRow() > hist.getLastRow())) hist = s;
  });
  (hist ? [hist] : []).concat(daily).forEach(function (s, i) {
    var v = s.getDataRange().getValues(), h = v[0];
    var c = { d: h.indexOf('Date'), q: h.indexOf('Query'), p: h.indexOf('Page'), cl: h.indexOf('Clicks'), im: h.indexOf('Impressions'), po: h.indexOf('Position') };
    if (c.d < 0 || c.p < 0) return;
    var dates = {};
    v.slice(1).forEach(function (r) {
      var d = d_(r[c.d]);
      if (i > 0 && seen[d]) return;
      dates[d] = true;
      rows.push({ date: d, query: c.q >= 0 ? r[c.q] : '', page: r[c.p], clicks: +r[c.cl] || 0, imp: +r[c.im] || 0, pos: +r[c.po] || 0 });
    });
    Object.keys(dates).forEach(function (d) { seen[d] = true; });
  });
  return rows;
}

function add_(m, k, r) {
  var x = m[k] || (m[k] = { k: k, c: 0, i: 0, p: 0, page: r.page, best: 0 });
  x.c += r.clicks; x.i += r.imp; x.p += r.pos * r.imp;
  if (r.imp > x.best) { x.best = r.imp; x.page = r.page; }
}
function top_(m, n) { return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.c - a.c || b.i - a.i; }).slice(0, n); }
function ctr_(x) { return x.i ? Math.round(x.c / x.i * 1000) / 10 + '%' : ''; }
function pos_(x) { return x.i ? Math.round(x.p / x.i * 10) / 10 : ''; }
function norm_(p) { return String(p).replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') || '/'; }
function d_(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy-MM-dd') : String(v); }
function values_(name) { var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); return s ? s.getDataRange().getValues() : [[]]; }

function cat_(p) {
  p = String(p);
  if (/kyoin|haken|kyuryo|koshi|recruit|bairitsu/i.test(p)) return '先生向け';
  if (/quotes|anime|naruto|jutsu|zelda|genshin|doraemon|tsundere|honorific|demon-slayer|death-note|one-piece|attack-on-titan|blue-lock/i.test(p)) return 'アニメ';
  if (/\?/.test(p)) return 'その他';
  return '親・一般';
}
