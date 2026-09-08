// Anonymous pageview logging. No cookies, no persistent visitor ID, and no
// IP capture (Apps Script never exposes the caller's IP to script code —
// see analytics-backend/Code.gs). Each pageview is a one-off, anonymous
// log entry: which page, when, and the referrer/browser the visitor's own
// browser reports about itself.
(function () {
  const ANALYTICS_URL = "https://script.google.com/macros/s/AKfycbyunRPpjACew_immHbWw-AUMELsiU94l4F1eaTtptVElPwrAb-zKEFJiyY_EAeBBZPQ/exec";
  if (!ANALYTICS_URL || ANALYTICS_URL.indexOf("PASTE_") === 0) return;

  const data = new URLSearchParams({
    page: location.pathname,
    referrer: document.referrer || "",
    ua: navigator.userAgent || "",
  });

  if (navigator.sendBeacon) {
    // Fire-and-forget: survives page navigation/unload, doesn't block
    // rendering, and there's no response to read anyway.
    navigator.sendBeacon(ANALYTICS_URL, data);
  } else {
    fetch(ANALYTICS_URL, { method: "POST", body: data, keepalive: true }).catch(() => {});
  }
})();
