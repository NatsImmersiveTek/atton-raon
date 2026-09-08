document.getElementById("year").textContent = new Date().getFullYear();

const form = document.getElementById("signup-form");
const successEl = document.getElementById("signup-success");
const frame = document.getElementById("signup-frame");

let submitted = false;

form.addEventListener("submit", (e) => {
  // Honeypot: a real visitor never sees or fills this field (hidden via
  // CSS). If it's filled in, it was almost certainly a bot — silently
  // drop the submission rather than sending it on.
  const honeypot = document.getElementById("company");
  if (honeypot && honeypot.value.trim() !== "") {
    e.preventDefault();
    return;
  }

  // The form posts to a hidden iframe (target="signup-frame") so the page
  // never navigates away and this works cross-origin against Apps Script
  // without needing CORS response headers, which Apps Script Web Apps
  // don't reliably send. We can't read the iframe's response (different
  // origin), so once it finishes loading we just assume success — real
  // validation (e.g. missing email) happens via the browser's own
  // required-field checks before this handler even runs.
  submitted = true;
});

frame.addEventListener("load", () => {
  if (!submitted) return; // ignore the iframe's initial blank load
  submitted = false;
  form.hidden = true;
  successEl.hidden = false;
});
