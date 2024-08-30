import Header from 'benefit/applicant/components/header/Header';
import TermsOfService from 'benefit/applicant/components/termsOfService/TermsOfService';
import { IS_CLIENT, LOCAL_STORAGE_KEYS } from 'benefit/applicant/constants';
import AppContext from 'benefit/applicant/context/AppContext';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import * as React from 'react';
import useAuth from 'shared/hooks/useAuth';
import theme from 'shared/styles/theme';
import { getLocalStorageItem } from 'shared/utils/localstorage.utils';
import { DefaultTheme } from 'styled-components';

import { ROUTES } from '../../constants';
import { $Main } from './Layout.sc';

const Footer = dynamic(
  () => import('benefit/applicant/components/footer/Footer'),
  { ssr: false }
);

type Props = { children: React.ReactNode };

const selectBgColor = (pathname: string): keyof DefaultTheme['colors'] => {
  switch (pathname) {
    case ROUTES.LOGIN:
      return theme.colors.silverLight as keyof DefaultTheme['colors'];

    case ROUTES.HOME:
      return theme.colors.silverLight as keyof DefaultTheme['colors'];

    case ROUTES.DECISIONS:
      return theme.colors.silverLight as keyof DefaultTheme['colors'];

    default:
      return theme.colors.white as keyof DefaultTheme['colors'];
  }
};

const Layout: React.FC<Props> = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const [isTermsOfServiceApproved, setIsTermsOfServiceApproved] =
    React.useState(false);
  const router = useRouter();

  const bgColor = selectBgColor(router.pathname);

  const { isSidebarVisible } = React.useContext(AppContext);

  const isTermsRoute = ![
    ROUTES.ACCESSIBILITY_STATEMENT,
    ROUTES.COOKIE_SETTINGS,
  ].includes(router.pathname as ROUTES);

  React.useEffect(() => {
    if (IS_CLIENT) {
      setIsTermsOfServiceApproved(
        // eslint-disable-next-line scanjs-rules/identifier_localStorage
        getLocalStorageItem(LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED) ===
          'true'
      );
    }
  }, []);

  return (
    <$Main
      $backgroundColor={bgColor}
      $isSidebarVisible={isSidebarVisible}
      {...rest}
    >
      <Header />
      {isAuthenticated && isTermsRoute && !isTermsOfServiceApproved ? (
        <TermsOfService
          setIsTermsOfServiceApproved={setIsTermsOfServiceApproved}
        />
      ) : (
        children
      )}
      <Footer />
    </$Main>
  );
};

export default Layout;
