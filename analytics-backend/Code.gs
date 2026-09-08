// ============================================================
// Atton=Raon anonymous pageview logger.
//
// Deployed the same way as the signup backend — see ANALYTICS-SETUP.md.
// This file isn't deployed by git; Apps Script projects live inside a
// Google Sheet, not this repo. Kept here so the code is versioned.
//
// Deliberately collects:
//   - which page was visited, and when
//   - the referrer (where the visitor came from)
//   - browser/device info, self-reported by the browser (navigator.userAgent)
//
// Deliberately does NOT collect:
//   - IP addresses — Apps Script doesn't expose the caller's IP to script
//     code at all, so this isn't a choice being made, it's a platform
//     limitation that happens to keep this privacy-friendly
//   - any cookie or persistent visitor ID — every row is a one-off,
//     anonymous log entry. There's no way to tell two visits from the
//     same person apart, or build a profile of anyone.
// ============================================================

const SHEET_NAME = "Pageviews";

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const page = (params.page || "").slice(0, 200);
    const referrer = (params.referrer || "").slice(0, 200);
    const userAgent = (params.ua || "").slice(0, 300);

    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), page, referrer, userAgent]);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + String(err));
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Page", "Referrer", "User Agent"]);
  }
  return sheet;
}
