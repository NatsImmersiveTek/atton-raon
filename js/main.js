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
// ============================================================

document.getElementById("year").textContent = new Date().getFullYear();

// Background video: fade it in after a fixed delay. Neither the iframe's
// own "load" event nor YouTube's onStateChange=PLAYING line up with when a
// frame is actually visibly painted — both fire while the player is still
// internally black/buffering, which was revealing the video (and running
// the title's color-invert blend) a few seconds before there was real
// color behind it. A flat delay sidesteps that mismatch entirely: the
// background just stays solid black, then cuts over once, fully formed.
const bgVideo = document.getElementById("bg-video");
if (bgVideo) {
  setTimeout(() => bgVideo.classList.add("loaded"), 3200);
}

// Sound toggle: the video autoplays muted (required by every browser), this
// button lets a visitor turn it on — needs the YouTube IFrame Player API
// (loaded via <script src="https://www.youtube.com/iframe_api"> in
// index.html) to control the embed after the fact. That script loads
// asynchronously and calls window.onYouTubeIframeAPIReady once it's ready.
const muteBtn = document.getElementById("mute-toggle");
if (muteBtn && bgVideo) {
  window.onYouTubeIframeAPIReady = () => {
    new YT.Player(bgVideo, {
      events: {
        onReady: (event) => {
          const player = event.target;
          let muted = true;

          muteBtn.addEventListener("click", () => {
            muted = !muted;
            if (muted) {
              player.mute();
            } else {
              player.unMute();
            }
            muteBtn.classList.toggle("is-muted", muted);
            muteBtn.setAttribute("aria-pressed", String(muted));
            muteBtn.setAttribute(
              "aria-label",
              muted ? "Unmute background video" : "Mute background video"
            );
          });
        },
      },
    });
  };

  // If the API script fails to load at all (e.g. offline), don't leave a
  // dead button on screen.
  setTimeout(() => {
    if (!window.YT) muteBtn.hidden = true;
  }, 5000);
}

const listEl = document.getElementById("shows-list");

if (!SHEET_CSV_URL) {
  setStatus("Shows aren't hooked up yet — add your Google Sheet URL in js/main.js.");
} else {
  loadShows(SHEET_CSV_URL);
}

async function loadShows(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Sheet request failed: " + res.status);
    const csvText = await res.text();
    const rows = parseCSV(csvText);
    renderShows(rows);
  } catch (err) {
    console.error(err);
    setStatus("Couldn't load shows right now. Check back soon.");
  }
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
