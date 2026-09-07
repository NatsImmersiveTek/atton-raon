# Atton=Raon — landing site

A single static page (no build step, no backend, no framework). Free to host,
loads fast, and your client can add/update upcoming shows just by editing a
Google Sheet — no login, no code.

## Structure

```
index.html      the page itself — edit text, video, and links here
css/style.css   styling
js/main.js      fetches the Google Sheet and renders the shows list
```

## 1. Set up the Upcoming Shows sheet (client-editable part)

1. Create a new Google Sheet. First row = headers, one row per show:

   | Date       | Venue           | City          | Link                     |
   |------------|-----------------|---------------|--------------------------|
   | 2026-10-14 | The Bowery Hall | New York, NY  | https://tickets.example  |
   | 2026-11-02 | Echo Lounge     | Atlanta, GA   | https://tickets.example  |

   - Column names can be in any order, and any case — the code just looks
     for columns containing "date", "venue", "city" (or "location"), and
     "link" (or "ticket"). Anything else in the header name is fine, e.g.
     "Ticket Link" or "City/Location" both still match.
   - **Date format** — any of these work:
     - `DD.MM.YYYY` (also accepts `/` or `-`), e.g. `23.02.2026` = 23 Feb 2026
     - `YYYY-MM-DD` (ISO), e.g. `2026-02-23`
     - Written out: `23 Feb 2026` or `Feb 23, 2026`
     - Whichever style you use, be consistent — a plain numeric date like
       `3.13.2026` is genuinely ambiguous (is `13` a month or a day?) and
       will be rejected rather than guessed at wrong. If a show doesn't show
       up, check its date is a real day.month.year first.
   - This date is what lets the site sort shows chronologically and
     auto-hide past ones — soonest show always on top.
   - `Link` is optional — leave it blank if there's nothing to link to yet.

2. Click **Share** (top right) and set access to **"Anyone with the link" — Viewer**.
3. The site already points at this sheet — [js/main.js](js/main.js) has:
   ```js
   const SHEET_CSV_URL =
     "https://docs.google.com/spreadsheets/d/1kEVKSjJUoWPGGQE3tvs28IfxWiG1bzSduRx35UWwz9g/export?format=csv&gid=0";
   ```
   If you ever swap to a different sheet, just replace the ID in that URL
   (the long string of characters between `/d/` and `/export`) and, if your
   show data lives on a tab other than the first one, update `gid=0` to that
   tab's gid (visible in the tab's URL when you click on it in Google Sheets).

That's it — from now on, your client just edits rows in the Sheet and the
site picks it up on next page load. No redeploy needed.

> Anyone with the link can read the sheet's contents (read-only, and only
> the columns you put in it). Don't put anything sensitive in it.
> Right now the sheet is empty — add the header row (Date, Venue, City, Link)
> plus one row per show and the site will pick it up automatically.

## 2. Edit the page content (video, text, links)

All in [index.html](index.html):

- **Background video**: find the YouTube video ID near the top of the
  `<body>` (inside `.bg-media`, in the `#bg-video` iframe's `src`) and
  replace it with your own (the part after `youtu.be/` or `v=` in the
  video's URL). It plays as the full-page background — muted, looping, no
  controls — cropped to fill the screen without ever squashing it. The
  background is plain black until the player has loaded, then the video
  fades in. Every browser blocks autoplaying video with sound, so it starts
  muted — the speaker icon top-right (`#mute-toggle` in `index.html`) lets
  visitors turn sound on, via the YouTube IFrame Player API.
  - Swapping to a different video is just changing the ID in two places in
    that same `src` URL: once after `/embed/`, and once in `playlist=` (that
    second one is what makes a single video loop — YouTube requires it).
- **Text**: hero tagline and the About paragraph are plain HTML — edit directly.
  - **Note**: the site title ("ATTON RAON") appears in two places, edit both:
    `<title>` in the `<head>`, and the `<h1>` in the hero.
- **Links**: edit the `<ul class="links-list">` items — swap `href="#"` for
  your real Vimeo and Bandcamp URLs.

## 3. Host it for free on GitHub Pages

1. Create a new GitHub repo (public is fine and free; private repos also get
   free Pages hosting).
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch → main / (root)**.
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   within a minute or two.
5. (Optional) Add a custom domain under the same Pages settings — GitHub
   Pages supports it for free, you just need to own the domain and point its
   DNS at GitHub.

## Notes on the "light + free" choices

- No build tools, no npm dependencies, no framework — just HTML/CSS/JS. There's
  nothing to break or go out of date.
- The video is embedded (YouTube), not hosted here — keeps the page tiny and
  avoids any bandwidth limits, even used full-screen as a background.
- Shows come from a live-fetched Google Sheet CSV rather than a CMS — your
  client edits a spreadsheet they already know how to use, and there's no
  login system, database, or admin panel to maintain.
- GitHub Pages hosting is free indefinitely for a site this size.
