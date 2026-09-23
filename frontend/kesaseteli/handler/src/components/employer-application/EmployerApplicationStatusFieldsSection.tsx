import {
  IconAlertCircle,
  IconCheckCircle,
  IconClock,
  StatusLabel,
} from 'hds-react';
import ApplicationStatusCard from 'kesaseteli/handler/components/form/ApplicationStatusCard';
import { $StatusValueWrapper } from 'kesaseteli/handler/components/form/ApplicationStatusCard.sc';
import {
  APPLICATION_LIST_TYPES,
  isHandledEmployerApplicationStatus,
} from 'kesaseteli/handler/types/application';
import HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';

const getStatusLabelProps = (
  status: EmployerApplicationStatus
): {
  type: 'success' | 'error' | 'alert' | 'info';
  icon: React.ReactNode;
} => {
  switch (status) {
    case EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT:
    case EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM:
      return {
        type: 'success',
        icon: <IconCheckCircle aria-hidden />,
      };

    case EmployerApplicationStatus.REJECTED:
    case EmployerApplicationStatus.CANCELLED:
    case EmployerApplicationStatus.ERROR_IN_PAYMENT:
      return {
        type: 'error',
        icon: <IconAlertCircle aria-hidden />,
      };

    case EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED:
    case EmployerApplicationStatus.PAYMENT_REVIEW:
      return {
        type: 'alert',
        icon: <IconClock aria-hidden />,
      };

    case EmployerApplicationStatus.SUBMITTED:
    case EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED:
    case EmployerApplicationStatus.APPLICATION_HANDLING:
    case EmployerApplicationStatus.DRAFT:
    default:
      return {
        type: 'info',
        icon: <IconAlertCircle aria-hidden />,
      };
  }
};

const EmployerApplicationStatusSection: React.FC<{
  application: HandlerEmployerApplication;
  withoutTitle?: boolean;
}> = ({ application, withoutTitle = false }) => {
  const { t } = useTranslation();
  const sectionTitle = t('common:handlerApplication.application');
  const statusProps = getStatusLabelProps(application.status);

  return (
    <>
      {!withoutTitle && (
        <FormSectionHeading
          aria-label={sectionTitle}
          header={sectionTitle}
          as="h4"
        />
      )}
      <ApplicationStatusCard
        submittedAt={application.submitted_at}
        status={
          <$StatusValueWrapper>
            <StatusLabel type={statusProps.type} iconStart={statusProps.icon}>
              {t(
                `common:applicationList.employer.status.${application.status}`
              )}
            </StatusLabel>
          </$StatusValueWrapper>
        }
        id={application.id}
        assignee={application.assignee}
        modified_at={application.modified_at}
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
        isHandled={isHandledEmployerApplicationStatus(application.status)}
      />
    </>
  );
};

export default EmployerApplicationStatusSection;
