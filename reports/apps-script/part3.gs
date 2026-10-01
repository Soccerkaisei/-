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

