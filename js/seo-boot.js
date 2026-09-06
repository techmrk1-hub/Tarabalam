(function () {
  const seo = window.BRAMHA_CONFIG?.seo || {};
  const token = String(seo.googleSiteVerification || '').trim();
  if (token && !document.querySelector('meta[name="google-site-verification"]')) {
    const meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    meta.content = token;
    document.head.appendChild(meta);
  }

  const ga = String(seo.ga4MeasurementId || '').trim();
  if (ga && !window.__BRAMHA_GA) {
    window.__BRAMHA_GA = ga;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', ga);
  }
})();
