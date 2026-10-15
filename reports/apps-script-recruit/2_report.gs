// ---------------- 日報（毎朝「日報」シートにまとめる。そのままコピーして Slack に貼れます） ----------------
// ニジアカの先生の応募数は GA4 では取れないので、「応募数_手入力」シートに 日付 と 件数 を1行ずつ入れてください。

function buildDailyReport() {
  var y = daysAgo_(1), lines = [];
  var users = byDate_(values_('ga_daily'), 1);
  var applyRows = values_('ga_daily_apply');
  var apply = byDate_(applyRows, 2);

  function sum(map, from, to) { var s = 0; Object.keys(map).forEach(function (d) { if (d >= from && d <= to) s += map[d]; }); return s; }
  var w1 = [daysAgo_(7), y], w0 = [daysAgo_(14), daysAgo_(8)];
  function wk(map) { return [sum(map, w1[0], w1[1]), sum(map, w0[0], w0[1])]; }
  function diff(a, b) { var d = a - b; return (d >= 0 ? '+' : '') + d; }
  function rate(a, b) { return b ? (Math.round(a / b * 1000) / 10) + '%' : '-'; }

  lines.push('【採用サイト 日報 ' + y.slice(5).replace('-', '/') + '】');

  lines.push('■ ニジアカの先生の応募（目標 月100）');
  var manual = byDate_(values_('応募数_手入力'), 1);
  var m28 = sum(manual, daysAgo_(28), y);
  lines.push('・直近28日 ' + m28 + '件／100（' + rate(m28, 100) + '）' + (Object.keys(manual).length ? '' : '　※「応募数_手入力」シートが空です'));

  lines.push('■ 採用サイトの訪問者');
  var u = wk(users);
  lines.push('・昨日 ' + (users[y] || 0) + '人／直近7日 ' + u[0] + '人（前の7日比 ' + diff(u[0], u[1]) + '）');

  lines.push('■ 大事なページの閲覧（直近7日・前の7日比）');
  var pages = values_('ga_daily_pages');
  KEY_PAGES.forEach(function (p) {
    var m = byDate_(pages.filter(function (r) { return r[1] === p[1]; }), 2), v = wk(m);
    lines.push('・' + p[0] + ' ' + v[0] + '回（' + diff(v[0], v[1]) + '）');
  });

  lines.push('■ 応募ボタンのクリック');
  var a = wk(apply);
  lines.push('・昨日 ' + (apply[y] || 0) + '回／直近7日 ' + a[0] + '回（' + diff(a[0], a[1]) + '）');
  lines.push('・訪問者に対する割合（7日）' + rate(a[0], u[0]) + '（前の7日 ' + rate(a[1], u[1]) + '）');
  var from28 = {};
  applyRows.forEach(function (r) { if (d_(r[0]) >= daysAgo_(28)) from28[r[1]] = (from28[r[1]] || 0) + r[2]; });
  var top = Object.keys(from28).sort(function (p, q) { return from28[q] - from28[p]; }).slice(0, 5);
  if (top.length) {
    lines.push('・応募ボタンが押されたページ（28日）');
    top.forEach(function (p) { lines.push('　' + p + '　' + from28[p] + '回'); });
  }

  lines.push('■ 検索（Search Console・直近28日）');
  var h = values_('gsc_history');
  if (h.length) {
    var now = h[h.length - 1], prev = h.length > 1 ? h[h.length - 2] : null, wkAgo = h.length > 7 ? h[h.length - 8] : null;
    lines.push('・3位以内 ' + now[2] + '語' + (prev ? '（前日比 ' + diff(now[2], prev[2]) + '）' : '') + (wkAgo ? '（1週間前比 ' + diff(now[2], wkAgo[2]) + '）' : ''));
    lines.push('・4〜20位 ' + now[3] + '語／21〜100位 ' + now[4] + '語');
    lines.push('・クリック ' + now[5] + '／表示 ' + now[6] + '（' + now[1] + '）');
  }

  var sheet = sheet_('日報');
  sheet.clearContents();
  sheet.getRange(1, 1, lines.length, 1).setValues(lines.map(function (l) { return [l]; }));
  sheet.getRange(lines.length + 2, 1).setValue('コピー用').setFontWeight('bold');
  sheet.getRange(lines.length + 3, 1).setValue(lines.join('\n'));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setActiveSheet(sheet); ss.moveActiveSheet(1);

  if (SLACK_WEBHOOK_URL) {
    UrlFetchApp.fetch(SLACK_WEBHOOK_URL, { method: 'post', contentType: 'application/json', payload: JSON.stringify({ text: lines.join('\n') }) });
  }
}

// [日付, ..., 値] の行から { 日付: 合計 } を作る（valueIndex は値の列）
function byDate_(rows, valueIndex) {
  var m = {};
  rows.forEach(function (r) { var d = d_(r[0]); if (d) m[d] = (m[d] || 0) + (Number(r[valueIndex]) || 0); });
  return m;
}
