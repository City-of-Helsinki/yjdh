import AlterationAccordionItem from 'benefit/handler/components/applicationReview/handlingView/AlterationAccordionItem';
import DecisionCalculationAccordion from 'benefit/handler/components/applicationReview/handlingView/DecisionCalculationAccordion';
import { HANDLED_STATUSES, ROUTES } from 'benefit/handler/constants';
import ReviewStateContext from 'benefit/handler/context/ReviewStateContext';
import DecisionSummary from 'benefit-shared/components/decisionSummary/DecisionSummary';
import StatusIcon from 'benefit-shared/components/statusIcon/StatusIcon';
import {
  ALTERATION_STATE,
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import {
  Application,
  DecisionDetailList,
} from 'benefit-shared/types/application';
import { ErrorData } from 'benefit-shared/types/common';
import { Button, IconPlus } from 'hds-react';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  const showMonetaryFields = ![
    APPLICATION_STATUSES.CANCELLED,
    APPLICATION_STATUSES.REJECTED,
    APPLICATION_STATUSES.INFO_REQUIRED,
  ].includes(application.status);
  const showBasicDecisionFields =
    application.status !== APPLICATION_STATUSES.CANCELLED;

  const decisionDetailList = useMemo<DecisionDetailList>(
    () => [
      {
        accessor: (app) => (
          <>
            <StatusIcon status={app.status} />
            {t(`common:applications.statuses.${app.status}`)}
          </>
        ),
        key: 'status',
      },
      {
        accessor: (app) =>
          formatFloatToCurrency(app.calculation?.calculatedBenefitAmount),
        key: 'benefitAmount',
        showIf: () => showMonetaryFields,
      },
      {
        accessor: (app) =>
          `${convertToUIDateFormat(app.startDate)} – ${convertToUIDateFormat(
            app.endDate
          )}`,
        key: 'benefitPeriod',
        showIf: () => showMonetaryFields,
      },
      {
        accessor: (app) => app.batch?.sectionOfTheLaw,
        key: 'sectionOfLaw',
        showIf: () => showBasicDecisionFields,
      },
      {
        accessor: (app) =>
          app.calculation.grantedAsDeMinimisAid
            ? t('utility.yes')
            : t('utility.no'),
        key: 'grantedAsDeMinimis',
        showIf: () => showMonetaryFields,
      },
      {
        accessor: (app) => convertToUIDateFormat(app.ahjoDecisionDate),
        key: 'decisionDate',
        showIf: () => showBasicDecisionFields,
      },
      {
        accessor: (app) =>
          app.batch?.handler &&
          getFullName(app.batch.handler.firstName, app.batch.handler.lastName),
        key: 'handler',
      },
      {
        accessor: (app) => app.batch?.decisionMakerName,
        key: 'decisionMaker',
        showIf: () => showBasicDecisionFields,
      },
    ],
    [t, showMonetaryFields, showBasicDecisionFields]
  );

  const hasPendingAlteration = application.alterations.some(
    (alteration) => alteration.state === ALTERATION_STATE.RECEIVED
  );

  const isAccepted = application.status === APPLICATION_STATUSES.ACCEPTED;

  const canCreate = !hasPendingAlteration && isAccepted;

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
          actions={[
            <Button
              theme="black"
              variant={canCreate ? 'secondary' : 'primary'}
              onClick={() =>
                router.push(
                  `${ROUTES.NEW_ALTERATION}?applicationId=${application.id}`
                )
              }
              iconLeft={<IconPlus />}
              disabled={!canCreate}
              aria-disabled={!canCreate}
            >
              {t('common:applications.decision.actions.reportAlteration')}
            </Button>,
          ]}
          itemComponent={AlterationAccordionItem}
          detailList={decisionDetailList}
          extraInformation={
            showMonetaryFields ? (
              <DecisionCalculationAccordion data={application} />
            ) : null
          }
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
        {application.archived &&
          application.status === APPLICATION_STATUSES.ACCEPTED && (
            <ArchivedView data={application} />
          )}
      </Container>
    </ReviewStateContext.Provider>
  );
};

export default HandlingStep1;
