import { useEffect } from 'react';

import { ASKEM_SCRIPT_URL } from '../constants';
import { canShowAskem } from '../utils/cookie';

export const useAskem = (
  lang: string | undefined,
  isSubmittedApplication: boolean,
  isLoading: boolean
): boolean => {
  const showAskem = canShowAskem(lang);
  useEffect(() => {
    if (!canShowAskem || isLoading) {
      return () => {};
    }

    const script = document.createElement('script');
    // eslint-disable-next-line scanjs-rules/assign_to_src
    script.src = ASKEM_SCRIPT_URL;
    script.type = 'text/javascript';
    const canonicalUrl = `${window.location.host}/application`;

    window.rnsData = {
      apiKey: process.env.NEXT_PUBLIC_ASKEM_API_KEY,
      title: 'Helsinki-lisä',
      canonicalUrl,
    };

    document.body.append(script);
    return () => {
      script.remove();
    };
  }, [lang, isSubmittedApplication, isLoading, showAskem]);
  return showAskem;
};
