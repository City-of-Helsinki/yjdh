import AppContext from 'benefit/applicant/context/AppContext';
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
  hasMessenger: boolean;
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ) => void;
  handleNavigationItemClick: (url: string) => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { hasMessenger } = React.useContext(AppContext);

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ): void => {
    e.preventDefault();

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage.value,
    });
  };

  const handleNavigationItemClick = (url: string): void => {
    void router.push(url);
  };

  return {
    t,
    languageOptions,
    locale,
    handleLanguageChange,
    handleNavigationItemClick,
    hasMessenger,
  };
};

export { useHeader };
