// ============================================================
// CONFIG — the only line you need to touch to hook up shows.
// ============================================================
// Sheet columns: Date, Venue, City, Link (order/case don't matter).
// Sharing on the sheet must be set to "Anyone with the link — Viewer"
// (Share button, top right of the sheet) for this URL to work.
// Full walkthrough in README.md.
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1kEVKSjJUoWPGGQE3tvs28IfxWiG1bzSduRx35UWwz9g/export?format=csv&gid=0";

// Set to true to keep showing past-dated shows instead of hiding them.
const SHOW_PAST_SHOWS = false;

// How often to re-check the sheet for updates, in minutes, without needing
// a manual page refresh. Set to 0 to disable and only load once.
const SHOWS_REFRESH_MINUTES = 5;
// ============================================================

document.getElementById("year").textContent = new Date().getFullYear();

// Hero title: scale it to exactly fill the normal content width (same
// 720px max-width the rest of the page's text uses — see main's CSS),
// not the full viewport. Monospace fonts render at slightly different
// widths per character across browsers/OS, so a fixed vw-based font-size
// can't hit "fills the width" precisely. Measuring via a <canvas> gives
// the text's true natural width at a given size, independent of the h1's
// own CSS layout — measuring the element itself would just read back
// whatever width we already gave it, not the text's intrinsic size.
let fitCanvas;
function fitHeroTitle() {
  const el = document.querySelector(".hero h1");
  if (!el) return;
  const contentMaxWidth = 720; // matches main's max-width in style.css
  const sidePadding = 40; // matches main's own left/right padding
  const target = Math.min(window.innerWidth, contentMaxWidth) - sidePadding;

  fitCanvas = fitCanvas || document.createElement("canvas");
  const ctx = fitCanvas.getContext("2d");
  const style = getComputedStyle(el);
  const baseSize = 100;
  ctx.font = `${style.fontWeight} ${baseSize}px ${style.fontFamily}`;
  const textWidth = ctx.measureText(el.textContent).width;
  if (!textWidth) return;

  const fitted = Math.max(28, (baseSize * target) / textWidth);
  el.style.fontSize = fitted + "px";
}
fitHeroTitle();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fitHeroTitle, 100);
});

// (Previously had a "video window" effect here — each letter showing the
// video through its shape, via a continuously-repainted <canvas>. Pulled
// it out: it was too heavy for mobile GPUs/decoders to keep up with
// alongside the background video itself, and broke on phones. Title is
// plain text again for now — see style.css for the styling.)

// Both video layers (background ambience + trailer) use the same reveal
// and autoplay approach — self-hosted <video> gives a genuinely reliable
// "first frame ready" signal via "loadeddata", unlike the old cross-origin
// YouTube embed. Some mobile browsers also don't reliably honor the plain
// "autoplay" HTML attribute by itself (even with muted + playsinline,
// which is supposed to be enough), so each one also gets an explicit
// .play() call with a first-tap fallback.
function revealAndPlay(video) {
  if (!video) return;
  video.addEventListener("loadeddata", () => video.classList.add("loaded"));
  // Fallback in case that event is somehow missed (e.g. video already
  // cached and ready before the listener attaches).
  if (video.readyState >= 2) video.classList.add("loaded");

  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        const resume = () => video.play().catch(() => {});
        document.addEventListener("touchstart", resume, { once: true, passive: true });
        document.addEventListener("click", resume, { once: true });
      });
    }
  };
  tryPlay();
}

const bgVideo = document.getElementById("bg-video");
const trailerVideo = document.getElementById("trailer-video");

// Trailer audio sits ~3dB quieter than its source file by default (once
// unmuted). <video>.volume is a linear 0–1 gain, not dB, so this is the
// standard conversion: 10^(-3/20) ≈ 0.708.
if (trailerVideo) trailerVideo.volume = 0.708;

revealAndPlay(bgVideo);
revealAndPlay(trailerVideo);

// Sound toggles: each video autoplays muted (required by every browser),
// these buttons let a visitor turn each one on independently. Self-hosted
// video needs none of the external-API machinery the old YouTube embed
// did — it's just a property on the element itself.
function bindMuteToggle(buttonId, video, label) {
  const btn = document.getElementById(buttonId);
  if (!btn || !video) return;
  btn.addEventListener("click", () => {
    video.muted = !video.muted;
    const muted = video.muted;
    btn.classList.toggle("is-muted", muted);
    btn.setAttribute("aria-pressed", String(muted));
    btn.setAttribute("aria-label", (muted ? "Unmute " : "Mute ") + label);
  });
}
bindMuteToggle("mute-toggle", bgVideo, "background ambience");
bindMuteToggle("trailer-mute-toggle", trailerVideo, "trailer video");

const listEl = document.getElementById("shows-list");

if (!SHEET_CSV_URL) {
  setStatus("Shows aren't hooked up yet — add your Google Sheet URL in js/main.js.");
} else {
  loadShows(SHEET_CSV_URL);
  startShowsAutoRefresh();
}

async function loadShows(url, { silent = false } = {}) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Sheet request failed: " + res.status);
    const csvText = await res.text();
    const rows = parseCSV(csvText);
    renderShows(rows);
  } catch (err) {
    console.error(err);
    // On a background refresh, a one-off network hiccup shouldn't wipe out
    // the shows list that's already on screen — just leave it as-is and
    // try again next interval. Only the very first load shows an error.
    if (!silent) setStatus("Couldn't load shows right now. Check back soon.");
  }
}

// Re-checks the sheet periodically so a client's edits show up without
// visitors needing to manually refresh the page. To avoid hammering
// Google's servers (or anyone's data plan) for no reason, this only polls
// while the tab is actually visible — a backgrounded/minimized tab does
// nothing — and re-checks immediately when the tab becomes visible again
// rather than waiting for the next interval.
function startShowsAutoRefresh() {
  if (!SHOWS_REFRESH_MINUTES) return;

  setInterval(() => {
    if (document.visibilityState === "visible") {
      loadShows(SHEET_CSV_URL, { silent: true });
    }
  }, SHOWS_REFRESH_MINUTES * 60 * 1000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadShows(SHEET_CSV_URL, { silent: true });
    }
  });
}

function setStatus(message) {
  listEl.innerHTML = `<li class="shows-status">${escapeHTML(message)}</li>`;
}

function renderShows(rows) {
  if (!rows.length) {
    setStatus("No upcoming shows announced yet — check back soon.");
    return;
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = {
    date: header.findIndex((h) => h.includes("date")),
    venue: header.findIndex((h) => h.includes("venue")),
    city: header.findIndex((h) => h.includes("city") || h.includes("location")),
    link: header.findIndex((h) => h.includes("link") || h.includes("ticket")),
  };

  let shows = rows
    .slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => ({
      dateRaw: idx.date > -1 ? (r[idx.date] || "").trim() : "",
      venue: idx.venue > -1 ? (r[idx.venue] || "").trim() : "",
      city: idx.city > -1 ? (r[idx.city] || "").trim() : "",
      link: idx.link > -1 ? (r[idx.link] || "").trim() : "",
    }));

  shows.forEach((s) => {
    s.date = parseShowDate(s.dateRaw);
  });

  if (!SHOW_PAST_SHOWS) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    shows = shows.filter((s) => !s.date || s.date >= today);
  }

  shows.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });

  if (!shows.length) {
    setStatus("No upcoming shows announced yet — check back soon.");
    return;
  }

  listEl.innerHTML = shows
    .map((s) => {
      const dateLabel = s.date
        ? s.date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : escapeHTML(s.dateRaw);

      const linkHTML = s.link
        ? `<a class="show-link" href="${escapeAttr(s.link)}" target="_blank" rel="noopener">Get Tickets</a>`
        : "";

      return `<li>
        <span class="show-date">${escapeHTML(dateLabel)}</span>
        <span class="show-venue">${escapeHTML(s.venue)}</span>
        <span class="show-city">${escapeHTML(s.city)}</span>
        ${linkHTML}
      </li>`;
    })
    .join("");
}

// Parses a show date from the sheet. Numeric dates with dot/slash/dash
// separators (e.g. "23.02.2026") are read as DAY.MONTH.YEAR — that format
// is genuinely ambiguous to JavaScript's built-in parser (it guesses
// month-first and gets it wrong, or fails outright), so we resolve it
// explicitly instead of guessing. ISO dates (2026-02-23) and written-out
// dates (23 Feb 2026 / Feb 23, 2026) aren't ambiguous and pass straight
// through to the native parser.
function parseShowDate(raw) {
  const s = raw.trim();
  if (!s) return null;

  const numeric = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]);
    const year = Number(numeric[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(year, month - 1, day);
    return isNaN(d) ? null : d;
  }

  const iso = s.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return isNaN(d) ? null : d;
  }

  const fallback = new Date(s);
  return isNaN(fallback) ? null : fallback;
}

// Minimal CSV parser: handles quoted fields, escaped quotes, commas/newlines inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip, \n handles the newline
      } else {
        field += c;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}
