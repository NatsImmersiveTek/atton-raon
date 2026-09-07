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

2. In the Sheet: **File → Share → Publish to web**.
   - Under "Link", pick the specific sheet/tab (not "Entire document").
   - Under format, choose **Comma-separated values (.csv)**.
   - Click **Publish**, copy the URL it gives you.

3. Open [js/main.js](js/main.js) and paste that URL into:
   ```js
   const SHEET_CSV_URL = "PASTE_URL_HERE";
   ```

That's it — from now on, your client just edits rows in the Sheet and the
site picks it up on next page load. No redeploy needed.

> Anyone with the published CSV link can read the sheet's contents (read-only,
> and only the columns you put in it). Don't put anything sensitive in it.

## 2. Edit the page content (video, text, links)

All in [index.html](index.html):

- **Video**: find `VIDEO_ID` in the `<iframe>` and replace it with your
  YouTube video ID (the part after `v=` in a YouTube URL). For Vimeo, swap
  the iframe `src` for `https://player.vimeo.com/video/VIDEO_ID`.
- **Text**: hero tagline and the About paragraph are plain HTML — edit directly.
  - **Note**: the site title ("ATTON RAON") appears in three separate places, edit all three: 
    `<title>` in the `<head>`, `.logo` in the header, and `<h1>` in the hero.
- **Links**: edit the `<ul class="links-list">` items — swap `href="#"` for
  real URLs (Instagram, Spotify, etc.) and the `mailto:` for a real email.

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
- The video is embedded (YouTube/Vimeo), not hosted here — keeps the page
  tiny and avoids any bandwidth limits.
- Shows come from a live-fetched Google Sheet CSV rather than a CMS — your
  client edits a spreadsheet they already know how to use, and there's no
  login system, database, or admin panel to maintain.
- GitHub Pages hosting is free indefinitely for a site this size.
