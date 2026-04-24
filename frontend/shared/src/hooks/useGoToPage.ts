import { useRouter } from 'next/router';
import React from 'react';
import useIsRouting from 'shared/hooks/useIsRouting';
import useLocale from 'shared/hooks/useLocale';
import GoToPageFunction from 'shared/types/go-to-page-function';

const useGoToPage = (): GoToPageFunction => {
  const router = useRouter();
  const locale = useLocale();
  const isAlreadyRouting = useIsRouting();
  return React.useCallback(
    (pagePath = '/', operation = 'push'): void => {
      if (isAlreadyRouting) return;

      // Ensure the path starts with a slash for consistent comparison and routing
      const normalizedPath = pagePath.startsWith('/')
        ? pagePath
        : `/${pagePath}`;

      // Guard: Don't route if we are already on the same path (including query params)
      if (normalizedPath === router.asPath) return;

      // Use shallow routing if only query parameters change (base path is the same)
      const isSamePage = normalizedPath.split('?')[0] === router.pathname;

      void router[operation](`/${locale}${normalizedPath}`, undefined, {
        shallow: isSamePage,
      });
    },
    [locale, router, isAlreadyRouting]
  );
};

export default useGoToPage;
