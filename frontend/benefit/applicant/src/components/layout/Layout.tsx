import Header from 'benefit/applicant/components/header/Header';
import TermsOfService from 'benefit/applicant/components/termsOfService/TermsOfService';
import { IS_CLIENT, LOCAL_STORAGE_KEYS } from 'benefit/applicant/constants';
import { useTranslation } from 'benefit/applicant/i18n';
import { CookieModal } from 'hds-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import * as React from 'react';
import useAuth from 'shared/hooks/useAuth';

import { ROUTES } from '../../constants';
import { $Main } from './Layout.sc';

type SupportedLanguage = 'fi' | 'en' | 'sv';
type ConsentObject = {
  [x: string]: boolean;
};

const Footer = dynamic(
  () => import('benefit/applicant/components/footer/Footer'),
  { ssr: true }
);

type Props = { children: React.ReactNode };

const Layout: React.FC<Props> = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  const [isTermsOfServiceApproved, setIsTermsOfSerivceApproved] =
    React.useState(false);
  const router = useRouter();
  const bgColor = router.pathname === ROUTES.LOGIN ? 'silverLight' : 'white';

  React.useEffect(() => {
    if (IS_CLIENT) {
      setIsTermsOfSerivceApproved(
        // eslint-disable-next-line scanjs-rules/identifier_localStorage
        localStorage.getItem(
          LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED
        ) === 'true'
      );
    }
  }, []);

  const [language, setLanguage] = React.useState<SupportedLanguage>(
    (i18n.language as SupportedLanguage) ?? 'fi'
  );
  const onLanguageChange = (newLang: SupportedLanguage): void =>
    setLanguage(newLang);
  const contentSource = {
    siteName: t('common:appName'),
    currentLanguage: language,
    optionalCookies: {
      cookies: [
        {
          commonGroup: 'statistics',
          commonCookie: 'matomo',
        },
      ],
    },
    language: {
      onLanguageChange,
    },
    focusTargetSelector: 'main',
    onAllConsentsGiven: (consents: ConsentObject) => {
      // TODO: Set tracking on/off based on each consent
      // eslint-disable-next-line no-console
      console.log(consents);
    },
  };
  return (
    <$Main backgroundColor={bgColor} {...rest}>
      <Header />
      {isAuthenticated && !isTermsOfServiceApproved ? (
        <TermsOfService
          setIsTermsOfSerivceApproved={setIsTermsOfSerivceApproved}
        />
      ) : (
        children
      )}
      <Footer />
      <CookieModal contentSource={contentSource} />;
    </$Main>
  );
};

export default Layout;
