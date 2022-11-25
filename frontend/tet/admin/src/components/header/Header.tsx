import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useGoToFrontPage from 'shared/hooks/useGoToFrontPage';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';
import useLogin from 'tet/admin/hooks/backend/useLogin';
import useLogout from 'tet/admin/hooks/backend/useLogout';
import useUserQuery from 'tet/admin/hooks/backend/useUserQuery';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { asPath } = router;
  const goToFrontPage = useGoToFrontPage();

  const languageOptions = React.useMemo(
    (): OptionType<string>[] =>
      SUPPORTED_LANGUAGES.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      })),
    [t],
  );

  const handleLanguageChange = React.useCallback(
    (e: React.SyntheticEvent<unknown>, { value: lang }: OptionType<string>): void => {
      e.preventDefault();
      void router.push(asPath, asPath, {
        locale: lang,
      });
    },
    [router, asPath],
  );

  // TODO login should probably be replaced with router.push('/login')`
  const login = useLogin('adfs');
  const userQuery = useUserQuery();

  const logout: () => void = useLogout();

  const isLoginPage = asPath?.startsWith('/login');

  return (
    <BaseHeader
      title={t('common:appName')}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      languages={languageOptions}
      onLanguageChange={handleLanguageChange}
      onTitleClick={goToFrontPage}
      login={
        !userQuery.isLoading
          ? {
              isAuthenticated: !isLoginPage && userQuery.isSuccess,
              loginLabel: t('common:header.loginLabel'),
              logoutLabel: t('common:header.logoutLabel'),
              onLogin: login,
              onLogout: logout,
              userName: userQuery.isSuccess ? userQuery.data.name : undefined,
              userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
            }
          : undefined
      }
      hideLogin={isLoginPage}
    />
  );
};

export default Header;
