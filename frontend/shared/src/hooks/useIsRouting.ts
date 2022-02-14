import { useRouter } from 'next/router';
import React from 'react';

const DONE_DURATION = 250;

// eslint-disable-next-line no-secrets/no-secrets
// The idea is based on this implementation: https://gist.github.com/jaydenseric/15a61ecfe3b52599409787c33fcfe9da
const useIsRouting = (): boolean => {
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const onRouteChangeStart = React.useCallback(() => {
    setIsRouting(true);
  }, [setIsRouting]);

  const onRouteChangeDone = React.useCallback(() => {
    setIsRouting(false);
    setTimeoutId(
      setTimeout(() => {
        setTimeoutId(null);
      }, DONE_DURATION)
    );
  }, [setIsRouting, setTimeoutId]);

  React.useEffect(() => {
    router.events?.on('routeChangeStart', onRouteChangeStart);
    router.events?.on('routeChangeComplete', onRouteChangeDone);
    router.events?.on('routeChangeError', onRouteChangeDone);

    return () => {
      router.events?.off('routeChangeStart', onRouteChangeStart);
      router.events?.off('routeChangeComplete', onRouteChangeDone);
      router.events?.off('routeChangeError', onRouteChangeDone);
    };
  }, [onRouteChangeDone, onRouteChangeStart, router.events]);

  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  return isRouting;
};

export default useIsRouting;
