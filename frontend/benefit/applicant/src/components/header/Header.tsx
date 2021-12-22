import useLogin from 'benefit/applicant/hooks/useLogin';
import useLogout from 'benefit/applicant/hooks/useLogout';
import useUserQuery from 'benefit/applicant/hooks/useUserQuery';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import BaseHeader from 'shared/components/header/Header';

import { useHeader } from './useHeader';

const Header: React.FC = () => {
  const {
    t,
    locale,
    languageOptions,
    handleLanguageChange,
    handleNavigationItemClick,
  } = useHeader();
  const router = useRouter();
  const { asPath } = router;

  const login = useLogin();
  const logout = useLogout();
  const userQuery = useUserQuery();
  const isLoginPage = asPath?.startsWith('/login');

  return (
    <BaseHeader
      title={t('common:appName')}
      menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
      languages={languageOptions}
      locale={locale}
      onLanguageChange={handleLanguageChange}
      onNavigationItemClick={handleNavigationItemClick}
      login={{
        isAuthenticated: !isLoginPage && userQuery.isSuccess,
        loginLabel: t('common:header.loginLabel'),
        logoutLabel: t('common:header.logoutLabel'),
        onLogin: !userQuery.isLoading ? login : noop,
        onLogout: !userQuery.isLoading ? logout : noop,
        userName: userQuery.isSuccess ? userQuery.data.name : undefined,
        userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
      }}
    />
  );
};

export default Header;
