import { Footer, Logo, logoFiDark, logoSvDark } from 'hds-react';
import { useTranslation } from 'react-i18next';
import React from 'react';
import useLocale from 'kesaseteli-shared/hooks/useLocale';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const logoLang = locale === 'sv' ? 'sv' : 'fi';
  const logoSrcFromLanguage = (): string => {
    if (logoLang === 'fi') return logoFiDark;
    if (logoLang === 'sv') return logoSvDark;
    if (logoLang === 'en') return logoFiDark;

    return logoFiDark;
  };

  if (!mounted) {
    return null;
  }

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
          <Footer.Link
            as="a"
            href={`/${locale}/cookie-settings`}
            label={t('common:cookieSettings')}
          />
        </Footer.Base>
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
