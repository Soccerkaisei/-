// ---------------- レポート（毎朝、先頭の「report」シートにまとめる） ----------------
// 初回だけ: 関数「setupReport」を選んで「実行」。以降は毎朝 7 時台に自動で作り直します。

function setupReport() {
  ScriptApp.getProjectTriggers().forEach(function (tr) {
    if (tr.getHandlerFunction() === 'buildReport') ScriptApp.deleteTrigger(tr);
  });
  ScriptApp.newTrigger('buildReport').timeBased().everyDays(1).atHour(7).inTimezone('Asia/Tokyo').create();
  buildReport();
}

function buildReport() {
  var out = [];
  var W = 8;
  function row(a) { a = a.slice(0, W); while (a.length < W) a.push(''); out.push(a); }
  function section(t) { row(['']); row(['■ ' + t]); }

  row(['ともだちじゃぱん レポート', Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm')]);

  // GA4 日別（直近21日・新しい順）
  var ev = {};
  values_('daily_events').slice(1).forEach(function (r) { ev[d_(r[0]) + '|' + r[1]] = r[2]; });
  section('GA4 日別（新しい順）');
  row(['date', 'users', 'sessions', 'engaged', 'form_start', 'school_signup', 'generate_lead', 'recruit_apply_click']);
  values_('daily_summary').slice(1).map(function (r) { return [d_(r[0])].concat(r.slice(1)); })
    .sort(function (a, b) { return a[0] < b[0] ? 1 : -1; }).slice(0, 21).forEach(function (r) {
      var k = r[0] + '|';
      row([r[0], r[1], r[3], r[4], ev[k + 'form_start'] || 0, ev[k + 'school_signup'] || 0, ev[k + 'generate_lead'] || 0, ev[k + 'recruit_apply_click'] || 0]);
    });

  // GA4 キーイベントがあった入口ページ（28日）
  var landing = {};
  section('キーイベントがあった入口ページ（GA4・28日）');
  row(['landingPage', 'sessions', 'keyEvents', '種類']);
  values_('landing_28d').slice(1).forEach(function (r) {
    landing[norm_(r[0])] = r[4];
    if (r[4] > 0) row([r[0], r[1], r[4], cat_(r[0])]);
  });

  // Search Console（直近28日）
  var gsc = loadGsc_();
  if (!gsc.length) { write_(out, W); return; }
  var maxDate = gsc.reduce(function (m, r) { return r.date > m ? r.date : m; }, '');
  var from = Utilities.formatDate(new Date(new Date(maxDate).getTime() - 27 * 864e5), 'UTC', 'yyyy-MM-dd');
  var pages = {}, queries = {}, cats = {};
  gsc.forEach(function (r) {
    if (r.date < from || r.date > maxDate) return;
    add_(pages, r.page, r); add_(cats, cat_(r.page), r);
    if (r.query) add_(queries, r.query, r);
  });
  section('検索（Search Console）' + from + '〜' + maxDate + ' 種類別');
  row(['種類', 'clicks', 'impressions']);
  top_(cats, 10).forEach(function (x) { row([x.k, x.c, x.i]); });

  section('検索 ページ上位40');
  row(['page', '種類', 'clicks', 'impressions', 'ctr', 'position', 'GA4 keyEvents(28日)']);
  top_(pages, 40).forEach(function (x) {
    var path = norm_(x.k);
    row([path, cat_(x.k), x.c, x.i, ctr_(x), pos_(x), landing[path] || 0]);
  });

  section('検索 検索語上位40');
  row(['query', 'clicks', 'impressions', 'ctr', 'position']);
  top_(queries, 40).forEach(function (x) { row([x.k, x.c, x.i, ctr_(x), pos_(x)]); });

  section('伸びしろ検索語（表示が多く順位4〜20位・先生/アニメ以外）');
  row(['query', 'clicks', 'impressions', 'ctr', 'position', 'よく出るページ']);
  Object.keys(queries).map(function (k) { return queries[k]; })
    .filter(function (x) { var p = x.p / x.i; return p >= 4 && p <= 20 && cat_(x.page) === '親・一般'; })
    .sort(function (a, b) { return b.i - a.i; }).slice(0, 30)
    .forEach(function (x) { row([x.k, x.c, x.i, ctr_(x), pos_(x), x.page.replace(/^https?:\/\/[^\/]+/, '')]); });

  write_(out, W);
}

function write_(out, W) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('report') || ss.insertSheet('report', 0);
  sheet.clearContents();
  sheet.getRange(1, 1, out.length, W).setValues(out);
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);
}
