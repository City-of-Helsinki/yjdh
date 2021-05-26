import { useRouter } from 'next/router';
import { OptionType } from 'shared/types/common';
import { i18n, useTranslation } from '../../../i18n';
import { SUPPORTED_LANGUAGES } from '../../../constants';
import useLocale  from '../../hooks/useLocale';

const useComponent = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const navigationItems = [
    { label: 'Link1', url: '/link1' },
    { label: 'Link2', url: '/link2' },
    { label: 'Link3', url: '/link3' },
  ];

  const getLanguageOptions = (): OptionType[] => {
    const createOptions = (languages: string[]) =>
      languages.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language as string,
      }));

    return createOptions(Object.values(SUPPORTED_LANGUAGES));
  };

  const languageOptions: OptionType[] = getLanguageOptions();

  const handleLanguageChange = (newLanguage: OptionType) => {
    i18n?.changeLanguage(newLanguage.value);
    //todo: fix router with localization
    //router.push(`/${newLanguage.value}`, `/${newLanguage.value}`, {locale: locale});
  }

  const handleNavigationItemClick = (pathname: string) =>  {
    router.push(pathname);
  }

  const handleTitleClick = () => handleNavigationItemClick('/')

  return { t, languageOptions, locale, navigationItems, handleLanguageChange, handleNavigationItemClick, handleTitleClick }
}

export { useComponent }
