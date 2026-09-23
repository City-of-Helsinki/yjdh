import AssignmentControls from 'kesaseteli/handler/components/assignment/AssignmentControls';
import { ApplicationListType } from 'kesaseteli/handler/types/application';
import type { Assignee } from 'kesaseteli-shared/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';

import {
  $AssigneeHeading,
  $FieldLabel,
  $FieldValue,
  $FieldWrapper,
  $StatusCard,
} from './ApplicationStatusCard.sc';

type Props = {
  submittedAt?: string | null;
  status: React.ReactNode;
  id: string;
  assignee?: Assignee | string | null;
  modified_at?: string;
  applicationType: ApplicationListType;
  isHandled?: boolean;
};

const ApplicationStatusCard: React.FC<Props> = ({
  submittedAt,
  status,
  id,
  assignee,
  modified_at,
  applicationType,
  isHandled = false,
}) => {
  const { t } = useTranslation();
  const dateLabelId = `status-card-date-label-${id}`;
  const dateLabel = t('common:handlerApplication.submitted_at');

  return (
    <$StatusCard data-testid="handlerApplication-status-card">
      <$FieldWrapper role="group" aria-labelledby={dateLabelId}>
        <$FieldLabel id={dateLabelId}>
          {dateLabel}
        </$FieldLabel>
        <$FieldValue>
          {convertToUIDateAndTimeFormat(submittedAt) || '-'}
        </$FieldValue>
      </$FieldWrapper>

      <$FieldWrapper data-testid="handlerApplication-status">
        <$FieldLabel>{t('common:handlerApplication.status')}</$FieldLabel>
        <$FieldValue>{status}</$FieldValue>
      </$FieldWrapper>

      {!isHandled && (
        <$FieldWrapper data-testid="handlerApplication-assignee-box">
          <$AssigneeHeading id="assignee-box-heading">
            {t('common:handlerApplication.assignee')}
          </$AssigneeHeading>
          <AssignmentControls
            id={id}
            assignee={assignee}
            modified_at={modified_at}
            applicationType={applicationType}
          />
        </$FieldWrapper>
      )}
    </$StatusCard>
  );
};

export default ApplicationStatusCard;
