import { useTranslation } from 'next-i18next';
import React from 'react';

import { StyledFooter } from './styled';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <StyledFooter title={t('common:appName')}>
      <StyledFooter.Base
        copyrightHolder={t('common:copyrightText')}
        copyrightText={t('common:allRightsReservedText')}
      />
    </StyledFooter>
  );
};

export default FooterSection;
