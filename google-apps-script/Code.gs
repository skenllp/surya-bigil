/**
 * RSVP backend for Surya & Bigil's wedding website.
 *
 * What this does:
 *  - Receives the RSVP form submission from the website
 *  - Appends a new row to a Google Sheet
 *  - Sends an email notification to bigilmathai916@gmail.com
 *
 * SETUP INSTRUCTIONS (do this once, takes ~5 minutes):
 *
 * 1. Go to https://sheets.new while logged in as bigilmathai916@gmail.com
 *    Name the spreadsheet something like "Wedding RSVPs".
 *
 * 2. In that spreadsheet, click Extensions > Apps Script.
 *
 * 3. Delete any starter code in the editor and paste in THIS ENTIRE FILE.
 *
 * 4. Click the Save icon (or Ctrl/Cmd+S).
 *
 * 5. Click "Deploy" (top right) > "New deployment".
 *    - Click the gear icon next to "Select type" and choose "Web app".
 *    - Description: RSVP handler (or anything you like)
 *    - Execute as: Me (bigilmathai916@gmail.com)
 *    - Who has access: Anyone
 *    - Click "Deploy".
 *
 * 6. Google will ask you to authorize the script — click "Authorize access",
 *    choose your bigilmathai916@gmail.com account, and if it shows an
 *    "unverified app" warning, click "Advanced" > "Go to (project name)
 *    (unsafe)" > "Allow". This is expected for personal scripts you wrote
 *    yourself, so it's safe to proceed.
 *
 * 7. Copy the "Web app URL" it gives you (it looks like
 *    https://script.google.com/macros/s/XXXXXXXX/exec).
 *
 * 8. Open index.html on your website, find the line:
 *        const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
 *    and replace the placeholder text with the URL you copied, keeping the
 *    quotes, e.g.:
 *        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
 *
 * 9. Save index.html and re-upload/re-deploy your site. Submit a test RSVP
 *    on the live site to confirm a new row appears in the sheet and an
 *    email arrives at bigilmathai916@gmail.com.
 *
 * NOTE: If you ever change the form fields, update this script to match.
 * NOTE: Every time you click "Deploy > New deployment" you get a NEW url —
 *       if you only need to update the code of an existing deployment, use
 *       "Deploy > Manage deployments > Edit (pencil icon) > New version"
 *       instead, which keeps the same URL.
 */

const NOTIFY_EMAIL = 'bigilmathai916@gmail.com';
const SHEET_NAME = 'RSVP';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Event(s)', 'Message']);
    }

    const data = e.parameter;
    const name       = data.name || '';
    const phone      = data.phone || '';
    const attendance = data.attendance || '';
    const guests     = data.guests || '';
    const eventName  = data.eventName || '';
    const message    = data.message || '';

    sheet.appendRow([new Date(), name, phone, attendance, guests, eventName, message]);

    const subject = 'New Wedding RSVP: ' + name + ' (' + attendance + ')';
    const body =
      'A new RSVP has come in for Surya & Bigil\'s wedding.\n\n' +
      'Name: ' + name + '\n' +
      'Phone: ' + phone + '\n' +
      'Attendance: ' + attendance + '\n' +
      'Guests: ' + guests + '\n' +
      'Event(s): ' + eventName + '\n' +
      'Message: ' + (message || '-') + '\n\n' +
      'View the full list in the "' + SHEET_NAME + '" sheet.';

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lets you open the URL in a browser to confirm the deployment is live.
function doGet(e) {
  return ContentService.createTextOutput('RSVP endpoint is live.');
}
