import { useTranslation } from 'benefit/applicant/i18n';
import React from 'react';

import { StyledFooter } from './styled';

const FooterSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StyledFooter title={t('common:appName')}>
      <StyledFooter.Base
        copyrightHolder={t('footer:copyrightText')}
        copyrightText={t('footer:allRightsReservedText')}
      />
    </StyledFooter>
  );
};

export default FooterSection;
