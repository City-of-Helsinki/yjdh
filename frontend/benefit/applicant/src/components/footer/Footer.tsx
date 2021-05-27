import { StyledFooter } from './styled';
import React from 'react';

import { useTranslation } from '../../../i18n';

const FooterSection = (): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <StyledFooter title={t('common:appName')}>
      <StyledFooter.Base
        copyrightHolder={t('footer:copyrightText')}
        copyrightText={t('footer:allRightsReservedText')}
      ></StyledFooter.Base>
    </StyledFooter>
  );
};

export default FooterSection;
