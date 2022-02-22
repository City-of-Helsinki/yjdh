import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { Language, SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { asPath } = router;

  const languageOptions = React.useMemo(
    (): OptionType<Language>[] =>
      SUPPORTED_LANGUAGES.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      })),
    [t]
  );

  const handleLanguageChange = React.useCallback(
    (
      e: React.SyntheticEvent<unknown>,
      { value: lang }: OptionType<string>
    ): void => {
      e.preventDefault();
      void router.push(asPath, asPath, {
        locale: lang,
      });
    },
    [router, asPath]
  );

  const onError = useErrorHandler(false);

  const login = useLogin();
  const userQuery = useUserQuery();
  const logoutQuery = useLogoutQuery();
  const logout = React.useCallback(
    () => logoutQuery.mutate({}, { onError }),
    [logoutQuery, onError]
  );

  const isLoading = userQuery.isLoading || logoutQuery.isLoading;
  const isLoginPage = asPath?.includes('/login');

  return (
    <BaseHeader
      title={t('common:appName')}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      languages={languageOptions}
      onLanguageChange={handleLanguageChange}
      login={
        !isLoading
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
    />
  );
};

export default Header;
