# Setting up the gig signup form

The form on [signup.html](signup.html) needs a small backend to actually
receive submissions — this uses Google Apps Script, tied to a Google
Sheet, entirely within your own Google account. No third-party service
ever sees the data.

## 1. Create the Sheet + script

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like "Atton=Raon Signups".
2. In that Sheet: **Extensions → Apps Script**. This opens the script
   editor in a new tab.
3. Delete whatever's in the default `Code.gs` file, and paste in the
   contents of [signup-backend/Code.gs](signup-backend/Code.gs) from this
   repo instead.
4. `NOTIFY_EMAIL` at the top is already set to `raonproductions@gmail.com`
   — change it there if that ever needs to be a different address.
5. Save the script (the disk icon, or Ctrl+S).

## 2. Deploy it as a Web App

1. Top right of the script editor: **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Fill in:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. It'll ask you to **authorize access** — this is Google's normal
   permission prompt for a script you wrote yourself asking to send email
   and edit the sheet it lives in. Click through it (you may see an
   "unverified app" warning since this script isn't published anywhere —
   click **Advanced → Go to (project name)** to proceed; this is normal
   and expected for a personal script).
6. Once deployed, copy the **Web app URL** it gives you — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 3. Wire it into the site

1. Open [signup.html](signup.html), find `PASTE_APPS_SCRIPT_URL_HERE`
   (in the `<form action="...">` attribute) and replace it with the URL
   from step 2.
2. Also find `PASTE_WHATSAPP_CHANNEL_LINK_HERE` and replace it with your
   WhatsApp Channel's invite link (looks like
   `https://whatsapp.com/channel/...` — from the channel's own "Invite
   people" option in the WhatsApp app).
3. Commit and push — same as any other change to the site (see the
   "day-to-day git workflow" you've already got down).

## Testing it

Open the live signup page, submit a test entry. You should see:
- A new row appear in the "Signups" tab of the Sheet
- An email land at `raonproductions@gmail.com`
- The page swap to the "thanks, join our WhatsApp Channel" message

If a submission doesn't show up anywhere, the most common cause is the
Web App URL in `signup.html` not matching exactly what Apps Script gave
you — double check it was pasted in full, including `/exec` at the end.

## If you ever need to update the script itself

Editing `signup-backend/Code.gs` in this repo does **not** update the
live version — Apps Script only runs whatever's pasted into the actual
script editor. After changing the code (here or there), copy the updated
version into the Apps Script editor, save, then **Deploy → Manage
deployments → edit (pencil icon) → New version → Deploy** to push the
change live. The Web App URL stays the same across versions, so nothing
in `signup.html` needs to change when you do this.

## About the QR code

Once the page is live with a real domain, print a QR code pointing at:
```
https://attonraon.com/signup.html
```
Ask me to generate the actual QR code image once you're at that point —
happy to produce a print-ready PNG.
