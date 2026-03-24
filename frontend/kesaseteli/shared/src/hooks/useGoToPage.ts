import { useRouter, usePathname } from 'next/navigation';
import React from 'react';
import GoToPageFunction from 'shared/types/go-to-page-function';
import useLocale from 'kesaseteli-shared/hooks/useLocale';

const useGoToPage = (): GoToPageFunction => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  return React.useCallback(
    (pagePath, operation = 'push'): void => {
      const path = `/${locale}${pagePath || '/'}`;
      if (path === pathname) {
        return;
      }
      void router[operation](path);
    },
    [locale, router, pathname]
  );
};

export default useGoToPage;
