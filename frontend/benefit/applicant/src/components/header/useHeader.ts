import { SUPPORTED_LANGUAGES } from 'benefit/applicant/constants';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { i18n, useTranslation } from 'benefit/applicant/i18n';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { NavigationItem, OptionType } from 'shared/types/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType[];
  locale: string;
  navigationItems?: NavigationItem[];
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType
  ) => void;
  handleNavigationItemClick: (pathname: string) => void;
  handleTitleClick: () => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

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

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType
  ): void => {
    e.preventDefault();
    if (i18n) {
      void i18n.changeLanguage(newLanguage.value);
    }
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
