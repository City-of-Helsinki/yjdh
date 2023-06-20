import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
  BENEFIT_TYPES,
} from 'benefit-shared/constants';
import { LoadingSpinner, StatusLabel } from 'hds-react';
import * as React from 'react';
import { ReactElement } from 'react';
import Container from 'shared/components/container/Container';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import HandlingApplicationActions from './actions/handlingApplicationActions/HandlingApplicationActions';
import ReceivedApplicationActions from './actions/receivedApplicationActions/ReceivedApplicationActions';
import ApplicationProcessingView from './applicationProcessingView/AplicationProcessingView';
import AttachmentsView from './attachmentsView/AttachmentsView';
import BenefitView from './benefitView/BenefitView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import ConsentView from './consentView/ConsentView';
import ContactPersonView from './contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from './coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from './deminimisView/DeminimisView';
import EmployeeView from './employeeView/EmployeeView';
import EmploymenAppliedMoreView from './employmentAppliedMoreView/EmploymentAppliedMoreView';
import EmploymentView from './employmentView/EmpoymentView';
import HandledView from './handledView/HandledView';
import NotificationView from './notificationView/NotificationView';
import PaySubsidyView from './paySubsidyView/PaySubsidyView';
import SalaryBenefitCalculatorView from './salaryBenefitCalculatorView/SalaryBenefitCalculatorView';
import { useApplicationReview } from './useApplicationReview';

const ApplicationReview: React.FC = () => {
  const {
    application,
    handledApplication,
    isLoading,
    t,
    isUploading,
    handleUpload,
  } = useApplicationReview();
  const theme = useTheme();

  const CalculatorView = (): ReactElement | null => {
    switch (application.benefitType) {
      case BENEFIT_TYPES.EMPLOYMENT:
        return <EmploymenAppliedMoreView data={application} />;

      case BENEFIT_TYPES.SALARY:
        return <SalaryBenefitCalculatorView data={application} />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (handledApplication?.status === application.status) {
    return (
      <>
        <ApplicationHeader data={application} />
        <NotificationView data={application} />
      </>
    );
  }

  return (
    <>
      <ApplicationHeader data={application} data-testid="application-header" />
      <Container data-testid="application-body">
        {application.status === APPLICATION_STATUSES.INFO_REQUIRED && (
          <StatusLabel
            css={`
              margin-bottom: ${theme.spacing.s};
            `}
            type="alert"
          >
            {t(`common:review.fields.editEndDate`, {
              date: convertToUIDateFormat(
                application.additionalInformationNeededBy
              ),
            })}
          </StatusLabel>
        )}
        <CompanyInfoView data={application} />
        <ContactPersonView data={application} />
        <DeminimisView data={application} />
        <CoOperationNegotiationsView data={application} />
        <EmployeeView
          data={application}
          handleUpload={handleUpload}
          isUploading={isUploading}
        />
        <PaySubsidyView
          data={application}
          handleUpload={handleUpload}
          isUploading={isUploading}
        />
        <BenefitView data={application} />
        <EmploymentView
          data={application}
          handleUpload={handleUpload}
          isUploading={isUploading}
        />
        {application.applicationOrigin === APPLICATION_ORIGINS.HANDLER ? (
          <AttachmentsView data={application} />
        ) : (
          <ConsentView
            data={application}
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
        )}
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <>
            <CalculatorView />
            <ApplicationProcessingView />
          </>
        )}
        {application.status &&
          HANDLED_STATUSES.includes(application.status) && (
            <HandledView data={application} />
          )}
      </Container>
      <StickyActionBar>
        {application.status === APPLICATION_STATUSES.RECEIVED && (
          <ReceivedApplicationActions
            application={application}
            data-testid="received-application-actions"
          />
        )}
        {(application.status === APPLICATION_STATUSES.HANDLING ||
          application.status === APPLICATION_STATUSES.INFO_REQUIRED ||
          (application.status &&
            HANDLED_STATUSES.includes(application.status))) && (
          <HandlingApplicationActions
            application={application}
            data-testid="handling-application-actions"
          />
        )}
      </StickyActionBar>
      <$StickyBarSpacing />
    </>
  );
};

export default ApplicationReview;
