import { IconMover } from 'hds-react';
import useLogin from 'kesaseteli/handler/hooks/backend/useLogin';
import useLogout from 'kesaseteli/handler/hooks/backend/useLogout';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useLocale from 'shared/hooks/useLocale';
import { useRouter } from 'next/router';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const navigationItems = [
    {
      label: t('common:header.createApplicationWithoutSsnLabel'),
      url: '/create-application-without-ssn/',
      icon: <IconMover />,
    },
  ];

  const login = useLogin();
  const logout = useLogout();
  const userQuery = useUserQuery({
    enabled: !router.asPath?.includes(ROUTES.COOKIE_SETTINGS),
  });

  return (
    <BaseHeader
      title={t('common:appName')}
      titleUrl={`/${locale}`}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      isNavigationVisible
      navigationItems={navigationItems}
      login={
        !userQuery.isLoading
          ? {
              isAuthenticated: userQuery.isSuccess,
              loginLabel: t('common:header.loginLabel'),
              logoutLabel: t('common:header.logoutLabel'),
              onLogin: login,
              onLogout: logout,
              userName: userQuery.isSuccess ? userQuery.data.name : undefined,
              userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
            }
          : undefined
      }
      theme="dark"
    />
  );
};

export default Header;
