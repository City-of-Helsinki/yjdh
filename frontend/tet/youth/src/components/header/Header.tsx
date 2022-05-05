import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SUPPORTED_LANGUAGES } from 'shared/i18n/i18n';
import { OptionType } from 'shared/types/common';

import { IconGlobe, LogoLanguage, Navigation } from 'hds-react';
import useLocale from 'shared/hooks/useLocale';
import { MAIN_CONTENT_ID } from 'shared/constants';

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
      })),
    [t],
  );

  const onLanguageChange = React.useCallback(
    (e: React.SyntheticEvent<unknown>, { value: lang }: OptionType<string>): void => {
      e.preventDefault();
      void router.push(asPath, asPath, {
        locale: lang,
      });
    },
    [router, asPath],
  );

  const titleClickHandler = () => {
    void router.push('/');
  };

  return (
    <Navigation
      title={t('common:appName')}
      menuToggleAriaLabel={t('common:header.menuToggleAriaLabel')}
      skipTo={`#${MAIN_CONTENT_ID}`}
      skipToContentLabel={t('common:header.linkSkipToContent')}
      logoLanguage={logoLang as LogoLanguage}
      onTitleClick={titleClickHandler}
    >
      <Navigation.Actions>
        {languages && onLanguageChange && (
          <Navigation.LanguageSelector
            buttonAriaLabel={t('common:header.languageMenuButtonAriaLabel')}
            label={locale?.toUpperCase()}
            icon={<IconGlobe />}
            closeOnItemClick
          >
            {languages.map((option) => (
              <Navigation.Item
                key={option.value}
                href="#"
                lang={option.value}
                label={option.label}
                onClick={(e: React.SyntheticEvent<unknown>) => onLanguageChange(e, option)}
              />
            ))}
          </Navigation.LanguageSelector>
        )}
      </Navigation.Actions>
    </Navigation>
  );
};

export default Header;
