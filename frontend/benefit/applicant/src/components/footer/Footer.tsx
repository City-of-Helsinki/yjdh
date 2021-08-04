import { useTranslation } from 'benefit/applicant/i18n';
import React from 'react';

import { $Footer } from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <$Footer title={t('common:appName')}>
      <$Footer.Base
        copyrightHolder={t('footer:copyrightText')}
        copyrightText={t('footer:allRightsReservedText')}
      />
    </$Footer>
  );
};

export default FooterSection;
