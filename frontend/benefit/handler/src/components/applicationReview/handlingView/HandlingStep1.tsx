import AlterationAccordionItem from 'benefit/handler/components/applicationReview/handlingView/AlterationAccordionItem';
import DecisionCalculationAccordion
  from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion';
import { HANDLED_STATUSES } from 'benefit/handler/constants';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import DecisionSummary from 'benefit-shared/components/decisionSummary/DecisionSummary';
import StatusIcon from 'benefit-shared/components/statusIcon/StatusIcon';
import { APPLICATION_ORIGINS, APPLICATION_STATUSES, } from 'benefit-shared/constants';
import { Application, DecisionDetailList } from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import * as React from 'react';
import { useMemo } from 'react';
import Container from 'shared/components/container/Container';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import ApplicationProcessingView from '../applicationProcessingView/ApplicationProcessingView';
import BenefitView from '../benefitView/BenefitView';
import CompanyInfoView from '../companyInfoView/CompanyInfoView';
import ConsentView from '../consentView/ConsentView';
import ContactPersonView from '../contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from '../coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from '../deminimisView/DeminimisView';
import EmployeeView from '../employeeView/EmployeeView';
import EmploymentView from '../employmentView/EmpoymentView';
import ArchivedView from '../handledView/archivedView/ArchivedView';
import HandledView from '../handledView/HandledView';
import PaperView from '../paperView/PaperView';
import SalaryBenefitCalculatorView from '../salaryBenefitCalculatorView/SalaryBenefitCalculatorView';
import { useApplicationReview } from '../useApplicationReview';

type HandlingStepProps = {
  application: Application;
  setIsRecalculationRequired: React.Dispatch<React.SetStateAction<boolean>>;
  isRecalculationRequired: boolean;
  calculationsErrors: ErrorData | undefined | null;
  setCalculationErrors: React.Dispatch<React.SetStateAction<ErrorData>>;
};

const HandlingStep1: React.FC<HandlingStepProps> = ({
  application,
  setIsRecalculationRequired,
  isRecalculationRequired,
  calculationsErrors,
  setCalculationErrors,
}) => {
  const { isUploading, handleUpload, reviewState, handleUpdateReviewState, t } =
    useApplicationReview();

  const decisionDetailList = useMemo<DecisionDetailList>(() => [
    {
      accessor: (app) => <>
        <StatusIcon status={app.status} />
        {t(`common:applications.statuses.${app.status}`)}
      </>,
      key: 'status',
    },
    {
      accessor: (app) => formatFloatToCurrency(app.calculatedBenefitAmount),
      key: 'benefitAmount',
    },
    {
      accessor: (app) => `${convertToUIDateFormat(app.startDate)} – ${convertToUIDateFormat(app.endDate)}`,
      key: 'benefitPeriod',
    },
    {
      accessor: (app) => app.batch?.sectionOfTheLaw,
      key: 'sectionOfLaw',
    },
    {
      accessor: (app) => app.calculation.grantedAsDeMinimisAid ? t('utility.yes') : t('utility.no'),
      key: 'grantedAsDeMinimis',
    },
    {
      accessor: (app) => convertToUIDateFormat(app.ahjoDecisionDate),
      key: 'decisionDate',
    },
    {
      accessor: (app) => app.batch?.handler && getFullName(app.batch.handler.firstName, app.batch.handler.lastName),
      key: 'handler',
    },
    {
      accessor: (app) => app.batch?.decisionMakerName,
      key: 'decisionMaker',
    },
  ], [t]);


  return (
    <ReviewStateContext.Provider
      value={{
        reviewState,
        handleUpdateReviewState,
      }}
    >
      <Container data-testid="application-body">
        <DecisionSummary
          application={application}
          actions={null}
          itemComponent={AlterationAccordionItem}
          detailList={decisionDetailList}
          extraInformation={<DecisionCalculationAccordion data={application} />}
        />
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

export default HandlingStep1;
