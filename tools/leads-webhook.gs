// getsites leads webhook — paste into script.google.com (New project), then:
// Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone > Deploy.
// Copy the /exec URL and put it in templates.json as site.leadWebhook.
var SHEET_ID = "1fDQV7DDa4cTmh1ffpXnJGQK8671yjyXgMIS1C2N_MB8";

function doPost(e) {
  var p = (e && e.parameter) || {};
  SpreadsheetApp.openById(SHEET_ID).getSheets()[0].appendRow([
    new Date(), p.name || "", p.email || "", p.prof || "", p.plan || "", p.matches || "", p.page || ""
  ]);
  return ContentService.createTextOutput("ok");
}
