import AppContext from 'benefit/handler/context/AppContext';
import { Footer, Logo, logoFiDark, LogoSize } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const { isFooterVisible, layoutBackgroundColor } =
    React.useContext(AppContext);

  if (!isFooterVisible) {
    return null;
  }

  return (
    <$FooterWrapper layoutBackgroundColor={layoutBackgroundColor}>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Base
          copyrightHolder={t('common:footer.copyrightText')}
          copyrightText={t('common:footer.allRightsReservedText')}
          logo={
            <Logo
              src={logoFiDark}
              size={LogoSize.Medium}
              alt="Helsingin kaupunki"
            />
          }
        />
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
