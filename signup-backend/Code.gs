// ============================================================
// Atton=Raon signup form backend.
//
// This file isn't deployed by git — Apps Script projects live inside a
// Google Sheet, not this repo. It's kept here so the code is versioned
// and easy to find; see SIGNUP-SETUP.md for how to actually deploy it.
// ============================================================

const SHEET_NAME = "Signups";
const NOTIFY_EMAIL = "raonproductions@gmail.com";

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    const name = (params.name || "").trim();
    const email = (params.email || "").trim();
    const phone = (params.phone || "").trim();
    const honeypot = (params.company || "").trim();

    // Bots that fill in every field tend to fill this one too — the real
    // form keeps it hidden from people. Silently accept-and-ignore rather
    // than error, so a bot can't tell it was rejected.
    if (honeypot !== "") {
      return respond({ ok: true });
    }

    if (!email) {
      return respond({ ok: false, error: "Email is required." });
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), name, email, phone]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "New signup: " + (name || email),
      body:
        "Name: " + (name || "(not given)") + "\n" +
        "Email: " + email + "\n" +
        "Phone: " + (phone || "(not given)") + "\n" +
        "Submitted: " + new Date().toString(),
    });

    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Email", "Phone"]);
  }
  return sheet;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
