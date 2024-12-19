import { ROUTES } from 'benefit/handler/constants';
import useLogin from 'benefit/handler/hooks/useLogin';
import useLogout from 'benefit/handler/hooks/useLogout';
import useUserQuery from 'benefit/handler/hooks/useUserQuery';
import noop from 'lodash/noop';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import * as React from 'react';
import { getFullName } from 'shared/utils/application.utils';
import { DefaultTheme } from 'styled-components';

import { $BaseHeader, $HeaderCustomItems } from './Header.sc';
import HeaderNotifier from './HeaderNotifier';
import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const { t, navigationItems, isNavigationVisible, handleLanguageChange } =
    useHeader();

  const login = useLogin();
  const logout = useLogout();

  const userQuery = useUserQuery();
  const { isLoading, isSuccess, data } = userQuery;

  const router = useRouter();
  const { asPath } = router;
  const isLoginPage = asPath?.startsWith(ROUTES.LOGIN);

  const TemporaryAhjoModeSwitch = dynamic(
    () => import('benefit/handler/components/header/TemporaryAhjoModeSwitch'),
    {
      ssr: false,
    }
  );

  const customItems = (
    <$HeaderCustomItems key="custom-items">
      <li key="header-notifier">
        <HeaderNotifier />
      </li>
      <li key="ahjo-mode-switch">
        <TemporaryAhjoModeSwitch />
      </li>
    </$HeaderCustomItems>
  );

  return (
    <$BaseHeader
      title={t('common:appName')}
      customItems={customItems}
      titleUrl={ROUTES.HOME}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      isNavigationVisible={isNavigationVisible}
      navigationItems={navigationItems}
      onLanguageChange={handleLanguageChange}
      theme={'dark' as unknown as DefaultTheme}
      login={{
        isAuthenticated: !isLoginPage && isSuccess,
        loginLabel: t('common:header.loginLabel'),
        logoutLabel: t('common:header.logoutLabel'),
        onLogin: !isLoading ? login : noop,
        onLogout: !isLoading ? logout : noop,
        userName: isSuccess
          ? getFullName(data?.first_name, data?.last_name)
          : undefined,
        userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
      }}
    />
  );
};

export default Header;
