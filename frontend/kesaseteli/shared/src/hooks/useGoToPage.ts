import { useRouter } from 'next/compat/router';
import React from 'react';
import useIsRouting from './useIsRouting';
import GoToPageFunction from 'shared/types/go-to-page-function';
import useLocale from 'kesaseteli-shared/hooks/useLocale';

const useGoToPage = (): GoToPageFunction => {
  const router = useRouter();
  const locale = useLocale();
  const isAlreadyRouting = useIsRouting();
  return React.useCallback(
    (pagePath, operation = 'push'): void => {
      if (!router) return;
      // if already routing, or we're trying to route to same path (including query params), do nothing
      if (isAlreadyRouting || pagePath === router.asPath) {
        return;
      }
      const path = `${locale}${pagePath || '/'}`;
      // use shallow route when we are already on the same path (ignoring query params)
      const shallow = pagePath === router.pathname;
      void router[operation](path, undefined, { shallow });
    },
    [locale, router, isAlreadyRouting]
  );
};

export default useGoToPage;
