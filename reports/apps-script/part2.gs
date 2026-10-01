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
  // 新しい日付を上に
  if (dimensions[0] === 'date') rows.sort(function (a, b) { return a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0; });
  return rows;
}

function formatDate_(yyyymmdd) {
  return yyyymmdd.slice(0, 4) + '-' + yyyymmdd.slice(4, 6) + '-' + yyyymmdd.slice(6, 8);
}

