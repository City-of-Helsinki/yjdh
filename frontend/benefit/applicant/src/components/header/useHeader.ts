import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React from 'react';
import { NavigationItem, OptionType } from 'shared/types/common';

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

  return {
    t,
    languageOptions,
    locale,
    handleLanguageChange,
    handleNavigationItemClick,
  };
};

export { useHeader };
