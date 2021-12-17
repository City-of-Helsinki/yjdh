import { useRouter } from 'next/router';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import GoToPageFunction from 'shared/types/go-to-page-function';
import useIsRouting from 'shared/hooks/useIsRouting';

const useGoToPage = (): GoToPageFunction => {
  const router = useRouter();
  const locale = useLocale();
  const isRouting = useIsRouting();

  return React.useCallback(
    (pagePath, options): void => {
      if (isRouting) {
        // if already routing dont re-route;
        return;
      }
      const path = `${locale}${pagePath || '/'}`;
      if (options) {
        const { operation, asPath, ...routerOptions } = options;
        const op = operation ?? 'push';
        const as = asPath ?? path;
        void router[op](path, as, routerOptions);
      } else {
        void router.push(path);
      }
    },
    [locale, router, isRouting]
  );
};

export default useGoToPage;
