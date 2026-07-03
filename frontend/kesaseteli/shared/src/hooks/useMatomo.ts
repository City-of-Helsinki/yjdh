import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { initMatomo, trackPageView } from 'shared/utils/matomo';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED === 'true';
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

export type UseMatomoProps = {
  enabled?: boolean;
  url?: string;
  siteId?: string;
  jsTrackerFile?: string;
  phpTrackerFile?: string;
};

/**
 * Custom hook to initialize Matomo analytics and track client-side page views.
 *
 * It registers two effects:
 * 1. Initializer Effect: Runs once to load the Matomo analytics script into the DOM
 *    if Matomo is fully configured (enabled, valid URL, and site ID).
 * 2. Route Tracker Effect: Listens to Next.js route transitions (`routeChangeComplete` event)
 *    and triggers client-side page-view tracking. To avoid duplicate tracking, the initial
 *    mount load is skipped (since the loaded Matomo script tracks the initial page view).
 *
 * @returns True if Matomo is enabled and configured, false otherwise.
 */
const useMatomo = ({
  enabled = MATOMO_ENABLED,
  url = MATOMO_URL,
  siteId = MATOMO_SITE_ID,
  jsTrackerFile = MATOMO_JS_TRACKER_FILE,
  phpTrackerFile = MATOMO_PHP_TRACKER_FILE,
}: UseMatomoProps = {}): boolean => {
  const isMatomoConfigured = !!(enabled && url && siteId);
  const router = useRouter();

  // Effect to initialize Matomo tracking scripts on mount
  useEffect(() => {
    if (isMatomoConfigured) {
      initMatomo({ url, siteId, jsTrackerFile, phpTrackerFile });
    }
  }, [isMatomoConfigured, url, siteId, jsTrackerFile, phpTrackerFile]);

  // Effect to track client-side page transitions in Next.js.
  // Uses router events to ensure page title and URL are updated in the DOM.
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isMatomoConfigured) {
      const handleRouteChange = (routeUrl: string): void => {
        setTimeout(() => {
          trackPageView(routeUrl);
        }, 0);
      };

      router.events?.on('routeChangeComplete', handleRouteChange);

      cleanup = () => {
        router.events?.off('routeChangeComplete', handleRouteChange);
      };
    }

    return cleanup;
  }, [isMatomoConfigured, router.events]);

  return isMatomoConfigured;
};

export default useMatomo;
