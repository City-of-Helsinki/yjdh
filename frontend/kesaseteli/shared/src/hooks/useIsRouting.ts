import { useRouter } from 'next/compat/router';
import React from 'react';

const useIsRouting = (): boolean => {
  const router = useRouter();
  const [isRouting, setIsRouting] = React.useState(false);

  React.useEffect(() => {
    const handleStart = (): void => setIsRouting(true);
    const handleStop = (): void => setIsRouting(false);

    router?.events.on('routeChangeStart', handleStart);
    router?.events.on('routeChangeComplete', handleStop);
    router?.events.on('routeChangeError', handleStop);

    return () => {
      router?.events.off('routeChangeStart', handleStart);
      router?.events.off('routeChangeComplete', handleStop);
      router?.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return isRouting;
};

export default useIsRouting;
