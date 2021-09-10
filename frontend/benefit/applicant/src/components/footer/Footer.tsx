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
          copyrightHolder={t('footer:copyrightText')}
          copyrightText={t('footer:allRightsReservedText')}
        />
      </Footer>
    </$FooterWrapper>
  );
};

export default FooterSection;
