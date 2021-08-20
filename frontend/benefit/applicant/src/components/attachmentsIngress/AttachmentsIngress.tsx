import { useTranslation } from 'benefit/applicant/i18n';
import * as React from 'react';
import { IconAlertCircle } from 'hds-react';

import {
  $WarningContainer,
  $Description,
  $Heading,
  $TextContainer,
} from './AttachmentsIngress.sc';

const AttachmentsIngress: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.attachments';
  return (
    <$TextContainer>
      <$Heading>
        {t(`${translationsBase}.heading1`)}
      </$Heading>
      <$Description>
        {t('common:attachmentsIngress.text')}
      </$Description>
      <$WarningContainer>
        <IconAlertCircle />{t('common:attachmentsIngress.warningText')}
      </$WarningContainer>
    </$TextContainer>
  );
};

export default AttachmentsIngress;
