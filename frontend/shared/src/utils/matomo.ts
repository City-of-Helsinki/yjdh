// Matomo analytics utility compatible with Next.js 15
type MatomoCommand = [string, ...unknown[]];
type MatomoQueue = MatomoCommand[];

export interface MatomoConfig {
  url: string;
  siteId: string;
  jsTrackerFile?: string;
  phpTrackerFile?: string;
}

const getPaq = (): MatomoQueue | undefined => {
  if (globalThis.window === undefined) {
    return undefined;
  }

  const globalObject = globalThis as typeof globalThis & {
    _paq?: MatomoQueue;
  };

  if (!globalObject._paq) {
    globalObject._paq = [];
  }

  return globalObject._paq;
};

export function initMatomo(config: MatomoConfig): void {
  const paq = getPaq();
  if (!paq) {
    return; // Don't run on server
  }

  const {
    url,
    siteId,
    jsTrackerFile = 'matomo.js',
    phpTrackerFile = 'matomo.php',
  } = config;

  // Require consent before tracking — consent is granted
  // via useCookieConsent hook when user accepts cookies
  paq.push(['requireConsent']);

  const u = url.endsWith('/') ? url : `${url}/`;
  paq.push(
    ['setTrackerUrl', `${u}${phpTrackerFile}`],
    ['setSiteId', siteId],
    ['trackPageView'],
    ['enableLinkTracking']
  );

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  // eslint-disable-next-line scanjs-rules/assign_to_src
  script.src = `${u}${jsTrackerFile}`;

  const firstScript = document.querySelectorAll('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

let previousUrl =
  globalThis.window === undefined ? undefined : globalThis.location.href;

export function trackPageView(url?: string): void {
  if (globalThis.window === undefined) {
    return;
  }

  const paq = getPaq();
  if (!paq) {
    return;
  }

  let currentUrl = url ?? globalThis.location.href;
  if (currentUrl.startsWith('/')) {
    currentUrl = `${globalThis.location.origin}${currentUrl}`;
  }

  if (previousUrl && previousUrl !== currentUrl) {
    paq.push(['setReferrerUrl', previousUrl]);
  }
  paq.push(
    ['setCustomUrl', currentUrl],
    ['setDocumentTitle', document.title],
    ['trackPageView']
  );

  previousUrl = currentUrl;
}

export function trackEvent(
  category: string,
  action: string,
  name?: string,
  value?: number
): void {
  const paq = getPaq();
  if (!paq) {
    return;
  }

  const params = [category, action, name, value].filter(
    (param): param is string | number => param !== undefined
  );
  paq.push(['trackEvent', ...params]);
}
