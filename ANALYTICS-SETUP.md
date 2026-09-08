# Setting up anonymous pageview logging

Same pattern as the signup form — a Google Apps Script Web App tied to a
Sheet, deployed under your own Google account. See
[SIGNUP-SETUP.md](SIGNUP-SETUP.md) for the fuller walkthrough of this
general approach; this is the short version for the analytics backend
specifically.

## 1. Create the Sheet + script

1. Create a new Google Sheet, name it something like "Atton=Raon Analytics".
2. **Extensions → Apps Script**.
3. Delete the default `Code.gs` contents, paste in
   [analytics-backend/Code.gs](analytics-backend/Code.gs) from this repo.
4. Save.

## 2. Deploy as a Web App

**Deploy → New deployment → Web app**:
- Execute as: **Me**
- Who has access: **Anyone**

Deploy, authorize (same "unverified app" prompt as before — click through
it), then copy the **Web app URL**.

## 3. Wire it into the site

Open [js/analytics.js](js/analytics.js), find `PASTE_ANALYTICS_APPS_SCRIPT_URL_HERE`
and replace it with that URL. Commit and push.

That's it — both `index.html` and `signup.html` already load this script.
If the URL is left as the placeholder, the script quietly does nothing
(no errors, just skips logging) — so there's no rush, the site works
fine either way until this is set up.

## Checking it's working

Visit the live site, then check the Sheet's "Pageviews" tab (auto-created
on first real hit) for a new row with a timestamp, page path, referrer,
and browser info.

## What this does and doesn't collect

See the comment block at the top of `analytics-backend/Code.gs` — short
version: page, timestamp, referrer, and the browser's self-reported user
agent. No IP address (Apps Script doesn't expose one to script code), no
cookies, no persistent visitor ID. Each row is anonymous and unlinkable
to any other row from the same visitor.
