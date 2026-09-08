document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("signup-form");
const successEl = document.getElementById("signup-success");
const frame = document.getElementById("signup-frame");

let submitted = false;

const formError = document.getElementById("signup-error");

form.addEventListener("submit", (e) => {
  // Honeypot: a real visitor never sees or fills this field (hidden via
  // CSS). If it's filled in, it was almost certainly a bot — silently
  // drop the submission rather than sending it on.
  const honeypot = document.getElementById("company");
  if (honeypot && honeypot.value.trim() !== "") {
    e.preventDefault();
    return;
  }

  // Neither field has a "required" attribute (someone might only want to
  // give a phone number, or only an email) — but both blank isn't a real
  // submission. We can't read the backend's response to catch this after
  // the fact (cross-origin iframe), so it has to be caught here instead.
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  if (!email && !phone) {
    e.preventDefault();
    if (formError) formError.hidden = false;
    return;
  }
  if (formError) formError.hidden = true;

  // The form posts to a hidden iframe (target="signup-frame") so the page
  // never navigates away and this works cross-origin against Apps Script
  // without needing CORS response headers, which Apps Script Web Apps
  // don't reliably send. We can't read the iframe's response (different
  // origin), so once it finishes loading we just assume success.
  submitted = true;
});

const REDIRECT_DELAY_MS = 4000;
const MAIN_SITE_URL = "index.html";

frame.addEventListener("load", () => {
  if (!submitted) return; // ignore the iframe's initial blank load
  submitted = false;
  form.hidden = true;
  successEl.hidden = false;
  setTimeout(() => {
    window.location.href = MAIN_SITE_URL;
  }, REDIRECT_DELAY_MS);
});
