import { $StatusIcon } from 'benefit/applicant/components/applications/Applications.sc';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { IconAlertCircleFill, IconCheckCircle, IconCheckCircleFill, IconCrossCircleFill } from 'hds-react';
import React from 'react';

type Props = {
  status: APPLICATION_STATUSES
}

const StatusIcon = ({ status }: Props): JSX.Element => {
  let Component;
  switch (status) {
    case APPLICATION_STATUSES.DRAFT:
      Component = <span />;
      break;

    case APPLICATION_STATUSES.INFO_REQUIRED:
      Component = IconAlertCircleFill;
      break;

    case APPLICATION_STATUSES.RECEIVED:
      Component = IconCheckCircle;
      break;

    case APPLICATION_STATUSES.ACCEPTED:
      Component = IconCheckCircleFill;
      break;

    case APPLICATION_STATUSES.REJECTED:
      Component = IconCrossCircleFill;
      break;

    case APPLICATION_STATUSES.CANCELLED:
      Component = IconCrossCircleFill;
      break;

    case APPLICATION_STATUSES.HANDLING:
      Component = IconCheckCircle;
      break;

    default:
      return <span />;
  }

  return (
    <$StatusIcon className={`status-icon status-icon--${status}`}>
      <Component />
    </$StatusIcon>
  );
};

export default StatusIcon;
