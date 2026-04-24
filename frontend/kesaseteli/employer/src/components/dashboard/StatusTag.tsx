import {
  IconAlertCircle,
  IconCheckCircle,
  IconClock,
  IconPen,
  IconTrash,
  StatusLabel,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Status from 'shared/types/application-status';

const StatusTag: React.FC<{ status: Status }> = ({ status }) => {
  const { t } = useTranslation();
  const label = t(`common:applications.statuses.${status}`);

  switch (status) {
    case 'accepted':
      return (
        <StatusLabel type="success" iconStart={<IconCheckCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'rejected':
      return (
        <StatusLabel type="error" iconStart={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'submitted':
    case 'additional_information_provided':
      return (
        <StatusLabel type="alert" iconStart={<IconClock aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'additional_information_requested':
      return (
        <StatusLabel type="info" iconStart={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'draft':
      return (
        <StatusLabel iconStart={<IconPen aria-hidden />}>{label}</StatusLabel>
      );

    case 'deleted_by_customer':
      return (
        <StatusLabel iconStart={<IconTrash aria-hidden />}>{label}</StatusLabel>
      );

    default:
      return <StatusLabel>{label}</StatusLabel>;
  }
};

export default StatusTag;
