import { Footer, Logo, logoFiDark } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <$FooterWrapper>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Base
          copyrightHolder={t('common:footer.copyrightText')}
          copyrightText={t('common:footer.allRightsReservedText')}
          backToTopLabel={t('common:footer.backToTop')}
          logo={
            <Logo src={logoFiDark} size="medium" alt="Helsingin kaupunki" />
          }
        >
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
