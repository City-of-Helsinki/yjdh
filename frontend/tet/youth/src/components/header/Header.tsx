import { Header as HdsHeader, Logo, logoFi, logoSv } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { MAIN_CONTENT_ID } from 'shared/constants';
import useLocale from 'shared/hooks/useLocale';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();

  const logoLang = locale === 'sv' ? 'sv' : 'fi';

  const { asPath } = router;

  const languages = React.useMemo(
    (): OptionType<string>[] =>
      SUPPORTED_LANGUAGES.map((language) => ({
        label: t(`common:languages.${language}`),
        value: language,
        isPrimary: true,
      })),
    [t],
  );

  const onLanguageChange = React.useCallback(
    (lang: string): void => {
      void router.push(asPath, asPath, {
        locale: lang,
      });
    },
    [router, asPath],
  );

  const logoSrcFromLanguage = (): string => {
    if (logoLang === 'fi') return logoFi;
    if (logoLang === 'sv') return logoSv;
    if (logoLang === 'en') return logoFi;
    return logoFi;
  };

  return (
    <HdsHeader onDidChangeLanguage={onLanguageChange} languages={languages}>
      <HdsHeader.SkipLink skipTo={`#${MAIN_CONTENT_ID}`} label={t('common:header.linkSkipToContent')} />
      <HdsHeader.ActionBar
        title={t('common:appName')}
        frontPageLabel={t('common:appName')}
        titleHref="/"
        logo={<Logo alt={t('common:helsinkiLogo')} size="large" src={logoSrcFromLanguage()} />}
        logoHref={'/'}
      >
        {languages && <HdsHeader.LanguageSelector ariaLabel={t('common:header.languageMenuButtonAriaLabel')} />}
      </HdsHeader.ActionBar>
    </HdsHeader>
  );
};

export default Header;
