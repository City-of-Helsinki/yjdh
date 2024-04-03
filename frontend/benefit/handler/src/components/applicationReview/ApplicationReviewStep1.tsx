import { HANDLED_STATUSES } from 'benefit/handler/constants';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import * as React from 'react';
import Container from 'shared/components/container/Container';

import ApplicationProcessingView from './applicationProcessingView/AplicationProcessingView';
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
import PaperView from './paperView/PaperView';
import SalaryBenefitCalculatorView from './salaryBenefitCalculatorView/SalaryBenefitCalculatorView';
import { useApplicationReview } from './useApplicationReview';

type ApplicationReviewStepProps = {
  application: Application;
  setIsRecalculationRequired: React.Dispatch<React.SetStateAction<boolean>>;
  isRecalculationRequired: boolean;
  calculationsErrors: ErrorData | undefined | null;
  setCalculationErrors: React.Dispatch<React.SetStateAction<ErrorData>>;
};

const ApplicationReviewStep1: React.FC<ApplicationReviewStepProps> = ({
  application,
  setIsRecalculationRequired,
  isRecalculationRequired,
  calculationsErrors,
  setCalculationErrors,
}) => {
  const { isUploading, handleUpload, reviewState, handleUpdateReviewState } =
    useApplicationReview();

  return (
    <ReviewStateContext.Provider
      value={{
        reviewState,
        handleUpdateReviewState,
      }}
    >
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
            <SalaryBenefitCalculatorView
              application={application}
              isRecalculationRequired={isRecalculationRequired}
              setIsRecalculationRequired={setIsRecalculationRequired}
              setCalculationErrors={setCalculationErrors}
              calculationsErrors={calculationsErrors}
            />
            <ApplicationProcessingView data={application} />
          </>
        )}
        {application.status &&
          HANDLED_STATUSES.includes(application.status) && (
            <HandledView data={application} />
          )}
        {application.archived && <ArchivedView data={application} />}
      </Container>
    </ReviewStateContext.Provider>
  );
};

export default ApplicationReviewStep1;
