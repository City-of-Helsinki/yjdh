import { useEffect } from 'react';
import { init } from '@socialgouv/matomo-next';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED === 'true';
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

const useMatomo = (): void =>
  useEffect(() => {
    if (MATOMO_ENABLED && MATOMO_URL && MATOMO_SITE_ID) {
      init({
        jsTrackerFile: MATOMO_JS_TRACKER_FILE,
        phpTrackerFile: MATOMO_PHP_TRACKER_FILE,
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, [
    MATOMO_ENABLED,
    MATOMO_URL,
    MATOMO_JS_TRACKER_FILE,
    MATOMO_PHP_TRACKER_FILE,
    MATOMO_SITE_ID,
  ]);

export default useMatomo;
