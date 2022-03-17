import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';

import {
  $Description,
  $Heading,
  $TextContainer,
} from './AttachmentsIngress.sc';

const AttachmentsIngress: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  return (
    <$TextContainer>
      <$Heading>{t(`${translationsBase}.heading1`)}</$Heading>
      <$Description>{t('common:attachmentsIngress.text')}</$Description>
    </$TextContainer>
  );
};

export default AttachmentsIngress;
