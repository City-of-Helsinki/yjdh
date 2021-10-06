import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';

import {
  $Description,
  $Heading,
  $TextContainer,
} from './CredentialsIngress.sc';

const CredentialsIngress: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.credentials';
  return (
    <$TextContainer>
      <$Heading>{t(`${translationsBase}.heading1`)}</$Heading>
      <$Description>{t('common:credentialsIngress.text')}</$Description>
    </$TextContainer>
  );
};

export default CredentialsIngress;
