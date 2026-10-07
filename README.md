# Atton=Raon — site

Static site (plain HTML/CSS/JS, no build step), hosted free on GitHub Pages.

```
index.html      main page
signup.html     "Connect" form (email / phone / message)
css/style.css   styling
js/             page scripts
assets/         videos and images
```

## Shows list

Upcoming shows are read live from a Google Sheet (columns: Date, Venue,
City, Link), so they can be updated without touching the code. The sheet
must be shared as "Anyone with the link — Viewer". Its address is set at the
top of `js/main.js`.

Dates can be `DD.MM.YYYY`, `YYYY-MM-DD`, or written out (`23 Feb 2026`).
Past shows are hidden automatically.

## Videos

- `assets/bg-video.mp4` — full-page looping background
- `assets/trailer.mp4` — trailer embed

Keep files compressed (a few MB to ~25MB) so the page loads quickly.

## Backends

The Connect form and the anonymous visit counter use small Google Apps
Script backends. Setup and redeploy steps are in `SIGNUP-SETUP.md` and
`ANALYTICS-SETUP.md`.
