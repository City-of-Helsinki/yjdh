import { CookieModal, CookiePage } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useCookieConsent from 'shared/hooks/useCookieConsent';
import useLocale from 'shared/hooks/useLocale';

type CookieConsentProps = {
  asPage?: boolean;
  siteName: string;
};

const CookieConsent = ({
  asPage = false,
  siteName,
}: CookieConsentProps): React.ReactElement => {
  const locale = useLocale();
  const router = useRouter();
  const { pathname, asPath, query } = router;

  const onLanguageChange = React.useCallback(
    (newLanguage: string): void => {
      void router.push({ pathname, query }, asPath, {
        locale: newLanguage,
      });
    },
    [router, pathname, query, asPath]
  );

  const { onAllConsentsGiven, onConsentsParsed, optionalCookies } =
    useCookieConsent();

  const contentSource = React.useMemo(
    () => ({
      siteName,
      currentLanguage: locale,
      optionalCookies,
      language: { onLanguageChange },
      onConsentsParsed,
      onAllConsentsGiven,
      focusTargetSelector: `#${MAIN_CONTENT_ID}`,
    }),
    [
      siteName,
      locale,
      optionalCookies,
      onLanguageChange,
      onConsentsParsed,
      onAllConsentsGiven,
    ]
  );

  return asPage ? (
    <CookiePage contentSource={contentSource} />
  ) : (
    <CookieModal contentSource={contentSource} />
  );
};

export default CookieConsent;
