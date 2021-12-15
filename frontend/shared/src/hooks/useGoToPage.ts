import { useRouter } from 'next/router';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

const useGoToPage = (
  pageSlug: string,
  operation?: 'push' | 'replace'
): (() => void) => {
  const router = useRouter();
  const locale = useLocale();
  return React.useCallback((): void => {
    void router[operation || 'push'](`${locale}${pageSlug}`);
  }, [router, operation, locale, pageSlug]);
};

export default useGoToPage;
