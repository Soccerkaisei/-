/**
 * 採用サイト（nijin.co.jp/recruit/）数値の自動取り込みと日報
 * GA4 + Search Console → このスプレッドシート
 *
 * 初回だけ:
 *   1. GA4_PROPERTY_ID に数字のIDを入れる（分からなければ関数「listGa4Properties」を実行 → 実行ログに候補が出ます）
 *   2. 関数「firstRun」を選んで「実行」→ 許可
 * 以降は毎朝 6 時台（日本時間）に dailyAll が自動で動き、「日報」シートを最新にします。
 *
 * すべて読み取り専用です（GA4・Search Console の設定は一切変更しません）。
 */

var GA4_PROPERTY_ID = '312812954';   // NIJIN（nijin.co.jp）
var HOST = 'nijin.co.jp';
var PATH_PREFIX = '/recruit/';
var START_DATE = '2026-08-01';
var APPLY_LINK = 'recruit/apply';    // 応募ボタンのリンク先に含まれる文字
var KEY_PAGES = [                    // 日報で毎日見るページ
  ['ニジアカの先生', '/recruit/nijinacademy-teacher/'],
  ['リアル教室長', '/recruit/nijinacademy-real/']
];
var SLACK_WEBHOOK_URL = '';          // 入れると、日報を Slack にも送ります（空なら送りません）

function firstRun() {
  ScriptApp.getProjectTriggers().forEach(function (tr) {
    if (tr.getHandlerFunction() === 'dailyAll') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('dailyAll').timeBased().everyDays(1).atHour(6).inTimezone('Asia/Tokyo').create();
  dailyAll();
}

function dailyAll() {
  [['GA4', updateGa4], ['Search Console', updateSearchConsole], ['日報', buildDailyReport]].forEach(function (t) {
    try { t[1](); log_(t[0], 'OK'); } catch (e) { log_(t[0], 'ERROR: ' + e.message); }
  });
}

function listGa4Properties() {
  var pageToken;
  do {
    var res = AnalyticsAdmin.AccountSummaries.list({ pageSize: 200, pageToken: pageToken });
    (res.accountSummaries || []).forEach(function (a) {
      (a.propertySummaries || []).forEach(function (p) {
        Logger.log(p.property.split('/')[1] + '  ' + p.displayName + '（' + a.displayName + '）');
      });
    });
    pageToken = res.nextPageToken;
  } while (pageToken);
}

// ---------------- GA4 ----------------

function updateGa4() {
  if (!GA4_PROPERTY_ID) throw new Error('GA4_PROPERTY_ID が空です。listGa4Properties で調べて入れてください');
  var property = 'properties/' + GA4_PROPERTY_ID;
  var daily = [{ startDate: START_DATE, endDate: 'yesterday' }];
  var last28 = [{ startDate: '28daysAgo', endDate: 'yesterday' }];
  var recruit = and_([eq_('hostName', HOST), begins_('pagePath', PATH_PREFIX)]);
  var apply = and_([eq_('eventName', 'click'), contains_('linkUrl', APPLY_LINK), begins_('pagePath', PATH_PREFIX)]);

  writeSheet_('ga_daily', ['date', 'users', 'newUsers', 'sessions', 'views'],
    runGa4_(property, ['date'], ['activeUsers', 'newUsers', 'sessions', 'screenPageViews'], daily, recruit));
  writeSheet_('ga_daily_pages', ['date', 'pagePath', 'views', 'users'],
    runGa4_(property, ['date', 'pagePath'], ['screenPageViews', 'activeUsers'], daily,
      and_([eq_('hostName', HOST), inList_('pagePath', KEY_PAGES.map(function (p) { return p[1]; }))])));
  writeSheet_('ga_daily_apply', ['date', 'pagePath', 'clicks', 'users'],
    runGa4_(property, ['date', 'pagePath'], ['eventCount', 'totalUsers'], daily, apply));
  writeSheet_('ga_pages_28d', ['pagePath', 'views', 'users'],
    runGa4_(property, ['pagePath'], ['screenPageViews', 'activeUsers'], last28, recruit));
  writeSheet_('ga_source_28d', ['sessionSourceMedium', 'sessions', 'users'],
    runGa4_(property, ['sessionSourceMedium'], ['sessions', 'activeUsers'], last28, recruit));
}

function runGa4_(property, dimensions, metrics, dateRanges, filter) {
  var rows = [], offset = 0, limit = 100000;
  while (true) {
    var req = {
      dateRanges: dateRanges,
      dimensions: dimensions.map(function (n) { return { name: n }; }),
      metrics: metrics.map(function (n) { return { name: n }; }),
      limit: limit, offset: offset
    };
    if (filter) req.dimensionFilter = filter;
    var res = AnalyticsData.Properties.runReport(req, property);
    (res.rows || []).forEach(function (row) {
      var dims = row.dimensionValues.map(function (v, i) { return dimensions[i] === 'date' ? fmtDate_(v.value) : v.value; });
      rows.push(dims.concat(row.metricValues.map(function (v) { return Number(v.value); })));
    });
    offset += limit;
    if (!res.rowCount || offset >= res.rowCount) break;
  }
  if (dimensions[0] === 'date') rows.sort(function (a, b) { return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0; });
  else rows.sort(function (a, b) { return b[1] - a[1]; });
  return rows;
}

function eq_(f, v) { return { filter: { fieldName: f, stringFilter: { matchType: 'EXACT', value: v } } }; }
function begins_(f, v) { return { filter: { fieldName: f, stringFilter: { matchType: 'BEGINS_WITH', value: v } } }; }
function contains_(f, v) { return { filter: { fieldName: f, stringFilter: { matchType: 'CONTAINS', value: v } } }; }
function inList_(f, vs) { return { filter: { fieldName: f, inListFilter: { values: vs } } }; }
function and_(xs) { return { andGroup: { expressions: xs } }; }
function fmtDate_(s) { return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8); }

// ---------------- Search Console ----------------
// アドオン「Search Analytics for Sheets」の Backups が毎日書き込むシートを読みます
// （Backups の設定：Group By = Date, Query, Page ／ Filter = Page contains nijin.co.jp/recruit/）

function updateSearchConsole() {
  var rows = loadSasRows_();
  if (!rows.length) throw new Error('Search Analytics for Sheets のシートが見つかりません。アドオンの Backups を設定してください');
  var maxDate = rows.reduce(function (m, r) { return r.date > m ? r.date : m; }, '');
  var start = Utilities.formatDate(new Date(new Date(maxDate).getTime() - 27 * 864e5), 'UTC', 'yyyy-MM-dd');
  var q = {}, p = {};
  rows.forEach(function (r) {
    if (r.date < start || r.date > maxDate) return;
    if (r.page.indexOf(HOST + PATH_PREFIX) === -1) return;
    add_(q, r.query, r); add_(p, r.page, r);
  });
  function toRows(m) {
    return Object.keys(m).map(function (k) { var x = m[k]; return [k, x.c, x.i, x.i ? Math.round(x.c / x.i * 1000) / 10 : 0, x.i ? Math.round(x.p / x.i * 10) / 10 : 0]; })
      .sort(function (a, b) { return b[1] - a[1] || b[2] - a[2]; });
  }
  var qr = toRows(q);
  writeSheet_('gsc_query_28d', ['query', 'clicks', 'impressions', 'ctr', 'position'], qr);
  writeSheet_('gsc_page_28d', ['page', 'clicks', 'impressions', 'ctr', 'position'], toRows(p));

  // 順位帯ごとの検索語の数を、毎日1行ずつ記録（推移を見るため）
  var a = 0, b = 0, c = 0, clicks = 0, imp = 0;
  qr.forEach(function (r) {
    clicks += r[1]; imp += r[2];
    if (r[4] <= 3) a++; else if (r[4] <= 20) b++; else if (r[4] <= 100) c++;
  });
  appendHistory_([daysAgo_(0), start + '〜' + maxDate, a, b, c, clicks, imp]);
}

// アドオンが作ったシート（見出しに Date / Query / Page / Clicks / Impressions / Position があるもの）を全部読む
function loadSasRows_() {
  var rows = [], seen = {};
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (s) {
    var v = s.getDataRange().getValues();
    if (v.length < 2) return;
    var h = v[0].map(String);
    var c = { d: h.indexOf('Date'), q: h.indexOf('Query'), p: h.indexOf('Page'), cl: h.indexOf('Clicks'), im: h.indexOf('Impressions'), po: h.indexOf('Position') };
    if (c.d < 0 || c.q < 0 || c.p < 0 || c.im < 0) return;
    v.slice(1).forEach(function (r) {
      // ページ内の見出しへのリンク（#s1 など）は同じページとして1つにまとめる
      var page = String(r[c.p]).replace(/#.*$/, '');
      var row = { date: d_(r[c.d]), query: String(r[c.q]), page: page, clicks: +r[c.cl] || 0, imp: +r[c.im] || 0, pos: +r[c.po] || 0 };
      var key = row.date + '|' + row.query + '|' + page;
      if (!seen[key] || row.imp > seen[key].imp) seen[key] = row;
    });
  });
  Object.keys(seen).forEach(function (k) { rows.push(seen[k]); });
  return rows;
}

function add_(m, k, r) {
  var x = m[k] || (m[k] = { c: 0, i: 0, p: 0 });
  x.c += r.clicks; x.i += r.imp; x.p += r.pos * r.imp;
}

function appendHistory_(row) {
  var sheet = sheet_('gsc_history');
  if (sheet.getLastRow() === 0) sheet.appendRow(['記録日', '集計期間', '3位以内', '4〜20位', '21〜100位', 'クリック', '表示']);
  var last = sheet.getLastRow();
  if (last > 1 && d_(sheet.getRange(last, 1).getValue()) === row[0]) sheet.getRange(last, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

// ---------------- 共通 ----------------

function sheet_(name) { var ss = SpreadsheetApp.getActiveSpreadsheet(); return ss.getSheetByName(name) || ss.insertSheet(name); }
function writeSheet_(name, header, rows) {
  var sheet = sheet_(name);
  sheet.clearContents();
  var values = [header].concat(rows);
  sheet.getRange(1, 1, values.length, header.length).setValues(values);
  sheet.setFrozenRows(1);
}
function values_(name) { var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); return s ? s.getDataRange().getValues().slice(1) : []; }
function log_(source, status) {
  var sheet = sheet_('_log');
  if (sheet.getLastRow() === 0) sheet.appendRow(['実行日時', '対象', '結果']);
  sheet.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm'), source, status]);
}
function daysAgo_(n) { return Utilities.formatDate(new Date(Date.now() - n * 864e5), 'Asia/Tokyo', 'yyyy-MM-dd'); }
function d_(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy-MM-dd') : String(v); }

// ---------------- 確認用 ----------------
// GA4 のこのプロパティで、どのサイトが見られているかを実行ログに出します
function checkGa4() {
  Logger.log('使っている番号: ' + GA4_PROPERTY_ID);
  var res = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'hostName' }],
    metrics: [{ name: 'screenPageViews' }],
    limit: 20
  }, 'properties/' + GA4_PROPERTY_ID);
  (res.rows || []).forEach(function (r) { Logger.log(r.dimensionValues[0].value + '  ' + r.metricValues[0].value); });
  if (!res.rows) Logger.log('このプロパティには、直近7日のデータがありません');
}
