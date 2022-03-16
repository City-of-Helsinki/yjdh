import { useTranslation } from 'benefit/applicant/i18n';
import { Footer } from 'hds-react';
import React from 'react';

import { $FooterWrapper } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <$FooterWrapper>
      <Footer title={t('common:appName')} theme="dark">
        <Footer.Base
          copyrightHolder={t('common:footer.copyrightText', {
            currentYear: new Date().getFullYear(),
          })}
          copyrightText={t('common:footer.allRightsReservedText')}
        />
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
