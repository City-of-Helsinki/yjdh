import { IconMover } from 'hds-react';
import isHandlerNewBetaUiEnabled from 'kesaseteli/handler/flags/is-handler-new-beta-ui-enabled';
import useLogin from 'kesaseteli/handler/hooks/backend/useLogin';
import useLogout from 'kesaseteli/handler/hooks/backend/useLogout';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useLocale from 'shared/hooks/useLocale';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const enableNewBetaUI = isHandlerNewBetaUiEnabled();

  const navigationItems = [
    // Display new dashboard and list views only when the new Beta UI feature flag is enabled
    ...(enableNewBetaUI
      ? [
          {
            label: t('common:header.dashboardLabel'),
            url: ROUTES.DASHBOARD,
          },
          {
            label: t('common:header.youthApplicationsLabel'),
            url: ROUTES.YOUTH_APPLICATIONS,
          },
          {
            label: t('common:header.employerApplicationsLabel'),
            url: ROUTES.EMPLOYER_APPLICATIONS,
          },
        ]
      : [
          {
            label: t('common:header.createApplicationWithoutSsnLabel'),
            url: ROUTES.CREATE_APPLICATION_WITHOUT_SSN,
            icon: <IconMover />,
          },
        ]),
  ];

  const login = useLogin();
  const logout = useLogout();
  const userQuery = useUserQuery({
    enabled: router.route !== ROUTES.COOKIE_SETTINGS,
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
