import useLogin from 'kesaseteli/employer/hooks/backend/useLogin';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import useUserQuery from 'kesaseteli/employer/hooks/backend/useUserQuery';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import useLocale from 'shared/hooks/useLocale';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { asPath } = router;
  const getLanguageOptions = (): OptionType<string>[] => {
    const createOptions = (
      languages: readonly string[]
    ): OptionType<string>[] =>
      languages.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      }));
    return createOptions(SUPPORTED_LANGUAGES);
  };

  const languageOptions = getLanguageOptions();

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    { value: lang }: OptionType<string>
  ): void => {
    e.preventDefault();
    void router.push(asPath, asPath, {
      locale: lang,
    });
  };

  const handleNavigationItemClick = (newPath: string): void => {
    void router.push(newPath);
  };

  const handleTitleClick = (): void => handleNavigationItemClick('/');

  const login = useLogin();
  const {
    data: user,
    isLoading: isLoadingUser,
    /*  error: loadingUserError, */
  } = useUserQuery();
  const {
    mutate: onLogout,
    isLoading: isLoadingLogout,
    /* error: logoutError, */
  } = useLogoutQuery();

  const isLoading = isLoadingUser || isLoadingLogout;

  return (
    <BaseHeader
      title={t('common:appName')}
      menuToggleAriaLabel={t('common:menuToggleAriaLabel')}
      languages={languageOptions}
      locale={locale}
      onLanguageChange={handleLanguageChange}
      onNavigationItemClick={handleNavigationItemClick}
      onTitleClick={handleTitleClick}
      login={
        !isLoading
          ? {
              isAuthenticated: Boolean(user),
              loginLabel: t('common:header.loginLabel'),
              logoutLabel: t('common:header.logoutLabel'),
              onLogin: login,
              onLogout: onLogout as () => void,
              userName: user?.name,
              userAriaLabelPrefix: t('common:header.userAriaLabelPrefix'),
            }
          : undefined
      }
    />
  );
};

export default Header;
