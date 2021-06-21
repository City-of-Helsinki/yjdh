import { useTranslation } from 'next-i18next';
import React from 'react';

import SC from './Footer.sc';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SC.Footer title={t('common:appName')}>
      <SC.Footer.Base
        copyrightHolder={t('common:copyrightText')}
        copyrightText={t('common:allRightsReservedText')}
      />
    </SC.Footer>
  );
};

export default FooterSection;
