import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import BaseHeader from 'shared/components/header/Header';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { asPath } = router;

  const languageOptions = React.useMemo(
    (): OptionType<string>[] =>
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

  return (
    <BaseHeader
      title={t('common:appName')}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      languages={languageOptions}
      onLanguageChange={handleLanguageChange}
    />
  );
};

export default Header;
