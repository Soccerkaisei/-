/**
 * ともだちじゃぱん 数値の自動取り込み（GA4 + Search Console → このスプレッドシート）
 *
 * 初回だけ: 関数「firstRun」を選んで「実行」→ 許可。
 * 以降は毎朝 5 時台（日本時間）に updateAll が自動で動き、各シートを最新に上書きします。
 * 動いた記録は「_log」シートに残ります。
 *
 * すべて読み取り専用です（GA4・Search Console の設定は一切変更しません）。
 */

// 自動で見つからなかったときだけ書き換える（GA4 管理 → プロパティの詳細 にある数字のID）
var GA4_PROPERTY_ID = '';
var SITE_HOST = 'tomodachi-japan.nijin.co.jp';
var START_DATE = '2026-06-01';

function firstRun() {
  setupDailyTrigger();
  updateAll();
}

function updateAll() {
  var tasks = [
    ['GA4', updateGa4],
    ['Search Console', updateSearchConsole]
  ];
  tasks.forEach(function (t) {
    try {
      t[1]();
      log_(t[0], 'OK');
    } catch (e) {
      log_(t[0], 'ERROR: ' + e.message);
    }
  });
}

function setupDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (tr) {
    if (tr.getHandlerFunction() === 'updateAll') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('updateAll').timeBased().everyDays(1).atHour(5).inTimezone('Asia/Tokyo').create();
}

// ---------------- GA4 ----------------

function updateGa4() {
  var property = 'properties/' + findGa4PropertyId_();
  var daily = [{ startDate: START_DATE, endDate: 'yesterday' }];
  var last28 = [{ startDate: '28daysAgo', endDate: 'yesterday' }];

  var reports = [
    ['daily_summary', ['date'], ['activeUsers', 'newUsers', 'sessions', 'engagedSessions', 'keyEvents'], daily],
    ['daily_events', ['date', 'eventName'], ['eventCount', 'totalUsers'], daily],
    ['daily_channel', ['date', 'sessionDefaultChannelGroup'], ['sessions', 'activeUsers', 'keyEvents'], daily],
    ['landing_28d', ['landingPage'], ['sessions', 'activeUsers', 'engagedSessions', 'keyEvents'], last28],
    ['signup_pages_28d', ['eventName', 'pagePath'], ['eventCount', 'totalUsers'], last28],
    ['source_28d', ['sessionSourceMedium'], ['sessions', 'activeUsers', 'keyEvents'], last28],
    ['country_28d', ['country'], ['activeUsers', 'sessions', 'keyEvents'], last28]
  ];

  reports.forEach(function (r) {
    var rows = runGa4Report_(property, r[1], r[2], r[3]);
    writeSheet_(r[0], r[1].concat(r[2]), rows);
  });
}

function findGa4PropertyId_() {
  if (GA4_PROPERTY_ID) return GA4_PROPERTY_ID;
  var found = [];
  var pageToken;
  do {
    var res = AnalyticsAdmin.AccountSummaries.list({ pageSize: 200, pageToken: pageToken });
    (res.accountSummaries || []).forEach(function (a) {
      (a.propertySummaries || []).forEach(function (p) {
        if (/tomodachi/i.test(p.displayName)) found.push(p.property.split('/')[1]);
      });
    });
    pageToken = res.nextPageToken;
  } while (pageToken);
  if (found.length !== 1) {
    throw new Error('GA4 プロパティを特定できません（候補 ' + found.length + ' 件）。GA4_PROPERTY_ID に数字のIDを入れてください');
  }
  return found[0];
}

function runGa4Report_(property, dimensions, metrics, dateRanges) {
  var rows = [];
  var offset = 0;
  var limit = 100000;
  while (true) {
    var res = AnalyticsData.Properties.runReport({
      dateRanges: dateRanges,
      dimensions: dimensions.map(function (n) { return { name: n }; }),
      metrics: metrics.map(function (n) { return { name: n }; }),
      limit: limit,
      offset: offset
    }, property);
    (res.rows || []).forEach(function (row) {
      var dims = row.dimensionValues.map(function (v, i) {
        return dimensions[i] === 'date' ? formatDate_(v.value) : v.value;
      });
      var mets = row.metricValues.map(function (v) { return Number(v.value); });
      rows.push(dims.concat(mets));
    });
    offset += limit;
    if (!res.rowCount || offset >= res.rowCount) break;
  }
  if (dimensions[0] === 'date') rows.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
  return rows;
}

function formatDate_(yyyymmdd) {
  return yyyymmdd.slice(0, 4) + '-' + yyyymmdd.slice(4, 6) + '-' + yyyymmdd.slice(6, 8);
}

// ---------------- Search Console ----------------

function updateSearchConsole() {
  var site = findGscSite_();
  var end = isoDaysAgo_(1);
  var reports = [
    ['gsc_page', ['date', 'page'], isoDaysAgo_(90)],
    ['gsc_query', ['date', 'query'], isoDaysAgo_(90)],
    ['gsc_query_page_28d', ['query', 'page'], isoDaysAgo_(28)]
  ];
  reports.forEach(function (r) {
    var rows = runGscQuery_(site, r[1], r[2], end);
    writeSheet_(r[0], r[1].concat(['clicks', 'impressions', 'ctr', 'position']), rows);
  });
}

function findGscSite_() {
  var res = gscFetch_('https://www.googleapis.com/webmasters/v3/sites', null);
  var sites = (res.siteEntry || []).map(function (s) { return s.siteUrl; });
  var exact = sites.filter(function (s) { return s.indexOf(SITE_HOST) !== -1; });
  if (exact.length) return exact[0];
  var domain = sites.filter(function (s) { return s === 'sc-domain:nijin.co.jp'; });
  if (domain.length) return domain[0];
  throw new Error('Search Console のプロパティが見つかりません。見えるもの: ' + sites.join(', '));
}

function runGscQuery_(site, dimensions, startDate, endDate) {
  var url = 'https://www.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(site) + '/searchAnalytics/query';
  var rows = [];
  var startRow = 0;
  var rowLimit = 25000;
  while (true) {
    var body = {
      startDate: startDate,
      endDate: endDate,
      dimensions: dimensions,
      rowLimit: rowLimit,
      startRow: startRow,
      dataState: 'all'
    };
    // ドメインプロパティの場合は、このサイトのページだけに絞る
    if (site.indexOf('sc-domain:') === 0) {
      body.dimensionFilterGroups = [{ filters: [{ dimension: 'page', operator: 'contains', expression: SITE_HOST }] }];
    }
    var res = gscFetch_(url, body);
    var batch = res.rows || [];
    batch.forEach(function (r) {
      rows.push(r.keys.concat([r.clicks, r.impressions, r.ctr, r.position]));
    });
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
  }
  return rows;
}

function gscFetch_(url, body) {
  var options = {
    method: body ? 'post' : 'get',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
  if (body) options.payload = JSON.stringify(body);
  var res = UrlFetchApp.fetch(url, options);
  if (res.getResponseCode() !== 200) {
    throw new Error('Search Console API ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 300));
  }
  return JSON.parse(res.getContentText());
}

function isoDaysAgo_(n) {
  var d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return Utilities.formatDate(d, 'Asia/Tokyo', 'yyyy-MM-dd');
}

// ---------------- シート書き込み ----------------

function writeSheet_(name, header, rows) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  var values = [header].concat(rows);
  sheet.getRange(1, 1, values.length, header.length).setValues(values);
  sheet.setFrozenRows(1);
}

function log_(source, status) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('_log') || ss.insertSheet('_log');
  if (sheet.getLastRow() === 0) sheet.appendRow(['実行日時', '対象', '結果']);
  sheet.appendRow([Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm'), source, status]);
}
