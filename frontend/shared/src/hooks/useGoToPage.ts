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
    (pagePath, operation = 'push'): void => {
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
