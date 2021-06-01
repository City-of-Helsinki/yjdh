import { SUPPORTED_LANGUAGES } from 'benefit/applicant/constants';
import { i18n, useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { NavigationItem, OptionType } from 'shared/types/common';

import useLocale from '../../hooks/useLocale';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType[];
  locale: string;
  navigationItems: NavigationItem[];
  handleLanguageChange: (newLanguage: OptionType) => void;
  handleNavigationItemClick: (pathname: string) => void;
  handleTitleClick: () => void;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const navigationItems = [
    { label: 'Link1', url: '/link1' },
    { label: 'Link2', url: '/link2' },
    { label: 'Link3', url: '/link3' },
  ];

  const getLanguageOptions = (): OptionType[] => {
    const createOptions = (languages: string[]): OptionType[] =>
      languages.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      }));

    // cimode goes here, not implemented

    return createOptions(Object.values(SUPPORTED_LANGUAGES));
  };

  const languageOptions: OptionType[] = getLanguageOptions();

  const handleLanguageChange = (newLanguage: OptionType): void => {
    if (i18n) {
      void i18n.changeLanguage(newLanguage.value);
    }
    // todo: fix router with localization
    // router.push(`/${newLanguage.value}`, `/${newLanguage.value}`, {locale: locale});
  };

  const handleNavigationItemClick = (pathname: string): void => {
    void router.push(pathname);
  };

  const handleTitleClick = (): void => handleNavigationItemClick('/');

  return {
    t,
    languageOptions,
    locale,
    navigationItems,
    handleLanguageChange,
    handleNavigationItemClick,
    handleTitleClick,
  };
};

export { useComponent };
