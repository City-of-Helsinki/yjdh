import {
  IconAlertCircle,
  IconCheckCircle,
  IconClock,
  IconPen,
  IconTrash,
  StatusLabel,
} from 'hds-react';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Status from 'shared/types/application-status';

const StatusTag: React.FC<{ status: Status }> = ({ status }) => {
  const { t } = useTranslation();
  const label = t(`common:applications.statuses.${status}`);

  // FIXME(YJDH-988): Get rid of Status type from shared frontend and after that
  //                  add the new statuses in EmployerApplicationStatus to this switch case.
  switch (status) {
    case 'accepted':
      return (
        <StatusLabel type="success" iconStart={<IconCheckCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.REJECTED:
      return (
        <StatusLabel type="error" iconStart={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.SUBMITTED:
    case EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED:
      return (
        <StatusLabel type="alert" iconStart={<IconClock aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED:
      return (
        <StatusLabel type="info" iconStart={<IconAlertCircle aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.DRAFT:
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
