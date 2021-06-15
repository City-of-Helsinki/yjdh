import { useTranslation } from 'next-i18next';
import React from 'react';

import { Footer } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Footer title={t('common:appName')}>
      <Footer.Base
        copyrightHolder={t('footer:copyrightText')}
        copyrightText={t('footer:allRightsReservedText')}
      />
    </Footer>
  );
};

export default FooterSection;
