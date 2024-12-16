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
        />
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
