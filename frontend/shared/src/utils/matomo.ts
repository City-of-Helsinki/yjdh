// Matomo analytics utility compatible with Next.js 15
declare global {
  interface Window {
    _paq: [string, ...unknown[]][];
  }
}

export interface MatomoConfig {
  url: string;
  siteId: string;
  jsTrackerFile?: string;
  phpTrackerFile?: string;
}

export function initMatomo(config: MatomoConfig): void {
  if (typeof window === 'undefined') {
    return; // Don't run on server
  }

  const {
    url,
    siteId,
    jsTrackerFile = 'matomo.js',
    phpTrackerFile = 'matomo.php',
  } = config;

  window._paq = window._paq || [];
  window._paq.push(['trackPageView'], ['enableLinkTracking']);

  const u = url.endsWith('/') ? url : `${url}/`;
  window._paq.push(
    ['setTrackerUrl', `${u}${phpTrackerFile}`],
    ['setSiteId', siteId]
  );

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.src = `${u}${jsTrackerFile}`;

  const firstScript = document.querySelectorAll('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

export function trackPageView(url?: string): void {
  if (typeof window === 'undefined' || !window._paq) {
    return;
  }

  if (url) {
    window._paq.push(['setCustomUrl', url]);
  }

  window._paq.push(['trackPageView']);
}

export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number
): void {
  if (typeof window === 'undefined' || !window._paq) {
    return;
  }

  const params = [category, action, name, value].filter(
    (param) => param !== undefined
  );
  window._paq.push(['trackEvent', ...params]);
}
