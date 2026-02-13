import useLocale from 'shared/hooks/useLocale';
import { useRouter } from 'next/router';
import React from 'react';
import { CookieModal, CookiePage } from 'hds-react';
import useCookieConsent from 'shared/hooks/useCookieConsent';
import { MAIN_CONTENT_ID } from 'shared/constants';

type CookieConsentProps = {
  asPage?: boolean;
  siteName: string;
};

const CookieConsent: React.FC<CookieConsentProps> = ({
  asPage = false,
  siteName,
}) => {
  const locale = useLocale();
  const router = useRouter();
  const { pathname, asPath, query } = router;

  const onLanguageChange = (newLanguage: string): void => {
    void router.push({ pathname, query }, asPath, {
      locale: newLanguage,
    });
  };

  const { onAllConsentsGiven, onConsentsParsed, optionalCookies } =
    useCookieConsent();

  const contentSource = {
    siteName,
    currentLanguage: locale,
    optionalCookies,
    language: { onLanguageChange },
    onConsentsParsed,
    onAllConsentsGiven,
    focusTargetSelector: `#${MAIN_CONTENT_ID}`,
  };

  return asPage ? (
    <CookiePage contentSource={contentSource} />
  ) : (
    <CookieModal contentSource={contentSource} />
  );
};

export default CookieConsent;
