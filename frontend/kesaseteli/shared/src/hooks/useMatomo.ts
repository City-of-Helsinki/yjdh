import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';

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
 * Use Matomo tracking
 * @returns True if Matomo is enabled and has URL & site ID, false otherwise.
 */
const useMatomo = ({
  enabled = MATOMO_ENABLED,
  url = MATOMO_URL,
  siteId = MATOMO_SITE_ID,
  jsTrackerFile = MATOMO_JS_TRACKER_FILE,
  phpTrackerFile = MATOMO_PHP_TRACKER_FILE,
}: UseMatomoProps = {}): boolean => {
  const isMatomoConfigured = !!(enabled && url && siteId);

  useEffect(() => {
    if (isMatomoConfigured) {
      init({ url, siteId, jsTrackerFile, phpTrackerFile });
    }
  }, [isMatomoConfigured, url, siteId, jsTrackerFile, phpTrackerFile]);

  return isMatomoConfigured;
};

export default useMatomo;
