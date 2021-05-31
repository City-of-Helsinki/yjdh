import React from 'react';

import { useTranslation } from '../../../i18n';
import { StyledFooter } from './styled';

const FooterSection = (): React.ReactElement => {
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
