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
