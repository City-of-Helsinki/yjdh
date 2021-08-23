import { useTranslation } from 'benefit/applicant/i18n';
import { IconAlertCircle } from 'hds-react';
import * as React from 'react';

import {
  $Description,
  $Heading,
  $TextContainer,
  $WarningContainer,
} from './AttachmentsIngress.sc';

const AttachmentsIngress: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  return (
    <$TextContainer>
      <$Heading>{t(`${translationsBase}.heading1`)}</$Heading>
      <$Description>{t('common:attachmentsIngress.text')}</$Description>
      <$WarningContainer>
        <IconAlertCircle />
        {t('common:attachmentsIngress.warningText')}
      </$WarningContainer>
    </$TextContainer>
  );
};

export default AttachmentsIngress;
