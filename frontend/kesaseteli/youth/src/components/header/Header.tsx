import useLocale from 'kesaseteli-shared/hooks/useLocale';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BaseHeader from 'shared/components/header/Header';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languageOptions = React.useMemo(
    (): OptionType<string>[] =>
      SUPPORTED_LANGUAGES.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
      })),
    [t]
  );

  const handleLanguageChange = React.useCallback(
    (lang: string): void => {
      if (!pathname) return;
      // In App Router with i18n middleware, we change the locale segment in the path
      const segments = pathname.split('/');
      segments[1] = lang;
      const newPath = segments.join('/');
      router.push(newPath);
    },
    [router, pathname]
  );

  return (
    <BaseHeader
      title={t('common:appName')}
      titleUrl={`/${locale}`}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      languages={languageOptions}
      onLanguageChange={handleLanguageChange}
    />
  );
};

export default Header;
