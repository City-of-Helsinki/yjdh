import {
  Footer,
  IconLinkExternal,
  Logo,
  logoFiDark,
  logoSvDark,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const logoLang = locale === 'sv' ? 'sv' : 'fi';
  const logoSrcFromLanguage = (): string => {
    if (logoLang === 'fi') return logoFiDark;
    if (logoLang === 'sv') return logoSvDark;
    if (logoLang === 'en') return logoFiDark;

    return logoFiDark;
  };

  return (
    <$FooterWrapper>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Utilities>
          <Footer.Link
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.contactUsLink')}
            label={t('common:footer.contactUs')}
            external
          />
        </Footer.Utilities>
        <Footer.Base
          copyrightHolder={t('common:footer.copyrightText')}
          copyrightText={t('common:footer.allRightsReservedText')}
          backToTopLabel={t('common:footer.backToTop')}
          logo={
            <Logo
              src={logoSrcFromLanguage()}
              size="medium"
              alt={t('common:helsinkiLogo')}
            />
          }
        >
          <Footer.Link
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.registerInformationLink')}
            label={t('common:footer.registerInformation')}
          />
          <Footer.Link
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.informationLink')}
            label={t('common:footer.information')}
          />
          <Footer.Link
            as="a"
            rel="noopener noreferrer"
            target="_blank"
            href={t('common:footer.accessibilityStatementLink')}
            label={t('common:footer.accessibilityStatement')}
          />
        </Footer.Base>
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
