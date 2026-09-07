# Atton Raon — landing site

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
     for columns containing "date", "venue", "city", "link"/"ticket".
   - Use a real date format like `2026-10-14` or `Oct 14, 2026` — anything
     JavaScript's `Date` parser understands. This lets the site sort shows
     automatically and hide past ones.
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

- **Background video**: find `VIMEO_ID` near the top of the `<body>` (inside
  `.bg-media`) and replace it with your Vimeo video ID (the number in the
  video's URL, e.g. `vimeo.com/123456789` → `123456789`). It plays as the
  full-page background — muted, looping, no controls (that's what Vimeo's
  `?background=1` does) — cropped to fill the screen without ever squashing
  it. The background photo (`assets/bg.jpg`) shows instantly and the video
  fades in over it once Vimeo's player has loaded, so there's no blank gap
  on a slow connection.
- **Text**: hero tagline and the About paragraph are plain HTML — edit directly.
  - **Note**: the site title ("ATTON RAON") appears in three separate places, edit all three: 
    `<title>` in the `<head>`, `.logo` in the header, and `<h1>` in the hero.
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
- The video is embedded (Vimeo), not hosted here — keeps the page tiny and
  avoids any bandwidth limits, even used full-screen as a background.
- Shows come from a live-fetched Google Sheet CSV rather than a CMS — your
  client edits a spreadsheet they already know how to use, and there's no
  login system, database, or admin panel to maintain.
- GitHub Pages hosting is free indefinitely for a site this size.
