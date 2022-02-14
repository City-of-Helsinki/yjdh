import { useRouter } from 'next/router';
import React from 'react';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

const useGetLanguage = (): (() => Language) => {
  const router = useRouter();
  return React.useCallback(
    () => (router.locale ?? DEFAULT_LANGUAGE) as Language,
    [router.locale]
  );
};

export default useGetLanguage;
