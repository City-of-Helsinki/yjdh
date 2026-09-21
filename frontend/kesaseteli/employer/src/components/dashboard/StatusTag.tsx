import {
  IconAlertCircle,
  IconBagCogwheel,
  IconCheckCircle,
  IconClock,
  IconCogwheels,
  IconError,
  IconPen,
  IconTrash,
  StatusLabel,
} from 'hds-react';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import { useTranslation } from 'next-i18next';
import React from 'react';

const StatusTag: React.FC<{ status: EmployerApplicationStatus }> = ({
  status,
}) => {
  const { t } = useTranslation();
  const label = t(`common:applications.statuses.${status}`);

  switch (status) {
    case EmployerApplicationStatus.PAYMENT_REVIEW:
      return (
        <StatusLabel type="alert" iconStart={<IconBagCogwheel aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.APPLICATION_HANDLING:
      return (
        <StatusLabel type="alert" iconStart={<IconCogwheels aria-hidden />}>
          {label}
        </StatusLabel>
      );

    case EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT:
    case EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM:
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

    case EmployerApplicationStatus.CANCELLED:
      return (
        <StatusLabel iconStart={<IconTrash aria-hidden />}>{label}</StatusLabel>
      );

    case EmployerApplicationStatus.ERROR_IN_PAYMENT:
      return (
        <StatusLabel type="error" iconStart={<IconError aria-hidden />}>
          {label}
        </StatusLabel>
      );

    default:
      return <StatusLabel>{label}</StatusLabel>;
  }
};

export default StatusTag;
