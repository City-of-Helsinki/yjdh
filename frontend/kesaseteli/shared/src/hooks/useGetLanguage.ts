import { useParams } from 'next/navigation';
import React from 'react';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

const useGetLanguage = (): (() => Language) => {
  const params = useParams();
  return React.useCallback(
    () => ((params?.locale ?? DEFAULT_LANGUAGE) as Language),
    [params?.locale]
  );
};

export default useGetLanguage;
