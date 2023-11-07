import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { IconLockOpen, LoadingSpinner } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import HandlingApplicationActions from './actions/handlingApplicationActions/HandlingApplicationActions';
import ReceivedApplicationActions from './actions/receivedApplicationActions/ReceivedApplicationActions';
import ApplicationProcessingView from './applicationProcessingView/AplicationProcessingView';
import { $InfoNeededBar } from './ApplicationReview.sc';
import BenefitView from './benefitView/BenefitView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import ConsentView from './consentView/ConsentView';
import ContactPersonView from './contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from './coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from './deminimisView/DeminimisView';
import EmployeeView from './employeeView/EmployeeView';
import EmploymentView from './employmentView/EmpoymentView';
import ArchivedView from './handledView/archivedView/ArchivedView';
import HandledView from './handledView/HandledView';
import NotificationView from './notificationView/NotificationView';
import PaperView from './paperView/PaperView';
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
    reviewState,
    handleUpdateReviewState,
  } = useApplicationReview();

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (handledApplication?.status === application.status) {
    return <NotificationView data={application} />;
  }

  return (
    <>
      <ApplicationHeader data={application} data-testid="application-header" />
      <ReviewStateContext.Provider
        value={{
          reviewState,
          handleUpdateReviewState,
        }}
      >
        {application.status === APPLICATION_STATUSES.INFO_REQUIRED && (
          <$InfoNeededBar>
            {t(`common:review.fields.editEndDate`, {
              date: convertToUIDateFormat(
                application.additionalInformationNeededBy
              ),
            })}
            <IconLockOpen />
          </$InfoNeededBar>
        )}
        <Container data-testid="application-body">
          {application.applicationOrigin === APPLICATION_ORIGINS.HANDLER && (
            <PaperView data={application} />
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
          <EmploymentView
            data={application}
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
          <BenefitView data={application} />
          <ConsentView
            data={application}
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
          {application.status === APPLICATION_STATUSES.HANDLING && (
            <>
              <SalaryBenefitCalculatorView data={application} />
              <ApplicationProcessingView data={application} />
            </>
          )}
          {application.status &&
            HANDLED_STATUSES.includes(application.status) && (
              <HandledView data={application} />
            )}
          {application.archived && <ArchivedView data={application} />}
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
      </ReviewStateContext.Provider>
    </>
  );
};

export default ApplicationReview;
