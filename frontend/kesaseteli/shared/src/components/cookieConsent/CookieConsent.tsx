import useLocale from 'kesaseteli-shared/hooks/useLocale';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

  const onLanguageChange = React.useCallback(
    (newLanguage: string): void => {
      const segments = pathname.split('/');
      segments[1] = newLanguage;
      router.push(segments.join('/'));
    },
    [router, pathname]
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
    <CookiePage contentSource={contentSource as any} />
  ) : (
    <CookieModal contentSource={contentSource as any} />
  );
};

export default CookieConsent;
