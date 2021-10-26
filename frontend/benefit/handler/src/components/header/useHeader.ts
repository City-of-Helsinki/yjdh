import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import { NavigationItem, OptionType } from 'shared/types/common';
import { getLanguageOptions } from 'shared/utils/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  locale: string;
  navigationItems?: NavigationItem[];
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ) => void;
  handleNavigationItemClick: (pathname: string) => void;
  handleTitleClick: () => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ): void => {
    e.preventDefault();
    void router.push('/', '/', { locale: newLanguage.value });
  };

  const handleNavigationItemClick = (pathname: string): void => {
    void router.push(pathname);
  };

  const handleTitleClick = (): void => handleNavigationItemClick('/');

  return {
    t,
    languageOptions,
    locale,
    handleLanguageChange,
    handleNavigationItemClick,
    handleTitleClick,
  };
};

export { useHeader };
