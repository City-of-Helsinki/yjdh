import { useEffect } from 'react';

import { ASKEM_SCRIPT_URL } from '../constants';
import { canShowAskem } from '../utils/cookie';

export const useAskem = (
  lang: string | undefined,
  isSubmittedApplication: boolean
): boolean => {
  const showAskem = canShowAskem(lang);
  useEffect(() => {
    if (!canShowAskem) {
      return () => {};
    }

    const script = document.createElement('script');
    // eslint-disable-next-line scanjs-rules/assign_to_src
    script.src = ASKEM_SCRIPT_URL;
    script.type = 'text/javascript';
    const canonicalUrl = `https://${window.location.host}/application`;

    window.rnsData = {
      apiKey: process.env.NEXT_PUBLIC_ASKEM_API_KEY,
      title: 'Helsinki-lisä',
      canonicalUrl,
      disableFonts: true,
    };

    document.body.append(script);
    return () => {
      script.remove();
    };
  }, [lang, isSubmittedApplication, showAskem]);
  return showAskem;
};
