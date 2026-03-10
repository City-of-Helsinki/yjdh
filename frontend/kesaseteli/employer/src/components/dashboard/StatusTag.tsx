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
        <StatusLabel type="success" iconLeft={<IconCheckCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'rejected':
      return (
        <StatusLabel type="error" iconLeft={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'submitted':
    case 'additional_information_provided':
      return (
        <StatusLabel type="alert" iconLeft={<IconClock aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'additional_information_requested':
      return (
        <StatusLabel type="info" iconLeft={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case 'draft':
      return (
        <StatusLabel iconLeft={<IconPen aria-hidden />}>{label}</StatusLabel>
      );

    case 'deleted_by_customer':
      return (
        <StatusLabel iconLeft={<IconTrash aria-hidden />}>{label}</StatusLabel>
      );

    default:
      return <StatusLabel>{label}</StatusLabel>;
  }
};

export default StatusTag;
