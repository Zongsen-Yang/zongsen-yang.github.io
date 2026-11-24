// Automatic visitor statistics: no UI, cookies, browser storage or client-side secret.
(() => {
  'use strict';
  const SITE = 'https://zongsen-yang.github.io';
  const ENDPOINT = 'https://homepage-collector.sensen-bugcat.workers.dev/collect';
  const url = new URL(window.location.href);
  if (url.origin !== SITE || !['/', '/index.html', '/life.html'].includes(url.pathname)) return;
  if (url.searchParams.has('preview') || url.searchParams.has('design')) return;
  if (window.__zongsenVisitorStatsInitialized) return;
  window.__zongsenVisitorStatsInitialized = true;

  function permitted() {
    if (navigator.globalPrivacyControl === true) return false;
    if ([navigator.doNotTrack, window.doNotTrack, navigator.msDoNotTrack].some(value => value === '1' || value === 1 || value === 'yes')) return false;
    return true;
  }

  let sent = false;
  function collect() {
    // One request per document load; hash navigation and history restores do not add views.
    if (sent || document.prerendering || document.visibilityState === 'hidden' || !permitted()) return;
    if (typeof window.fetch !== 'function') return;
    sent = true;
    let referrerHost = null;
    try {
      const referrer = new URL(document.referrer);
      if (['http:', 'https:'].includes(referrer.protocol)) referrerHost = referrer.hostname;
    } catch { /* Direct visits have no referrer. */ }
    const payload = { path: url.pathname === '/index.html' ? '/' : url.pathname, referrer_host: referrerHost };
    try {
      // Explicit cors mode preserves Origin even with no-referrer. A text/plain
      // JSON body avoids an unnecessary CORS preflight, and credentials are omitted.
      window.fetch(ENDPOINT, {
        method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error',
        referrerPolicy: 'no-referrer', cache: 'no-store', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload)
      }).catch(() => {}); // Never interrupt the page or retry a possibly stored visit.
    } catch { /* Statistics must not affect the homepage. */ }
  }

  document.addEventListener('visibilitychange', collect);
  document.addEventListener('prerenderingchange', collect);
  collect();
})();
