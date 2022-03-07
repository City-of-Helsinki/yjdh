import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { APPLICATION_STATUSES, BENEFIT_TYPES } from 'benefit/handler/constants';
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
import BenefitView from './benefitView/BenefitView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import ConsentView from './consentView/ConsentView';
import ContactPersonView from './contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from './coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from './deminimisView/DeminimisView';
import EmployeeView from './employeeView/EmployeeView';
import EmploymenAppliedMoreView from './employmentAppliedMoreView/EmploymentAppliedMoreView';
import EmploymentView from './employmentView/EmpoymentView';
import HandledVew from './handledView/HandledView';
import NotificationView from './notificationView/NotificationView';
import PaySubsidyView from './paySubsidyView/PaySubsidyView';
import SalaryBenefitCalculatorView from './salaryBenefitCalculatorView/SalaryBenefitCalculatorView';
import { useApplicationReview } from './useApplicationReview';

const ApplicationReview: React.FC = () => {
  const { application, handledApplication, isLoading, t } =
    useApplicationReview();
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
      <ApplicationHeader data={application} />
      <Container>
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
        <EmployeeView data={application} />
        <PaySubsidyView data={application} />
        <BenefitView data={application} />
        <EmploymentView data={application} />
        <ConsentView data={application} />
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <>
            <CalculatorView />
            <ApplicationProcessingView />
          </>
        )}
        {(application.status === APPLICATION_STATUSES.ACCEPTED ||
          application.status === APPLICATION_STATUSES.CANCELLED ||
          application.status === APPLICATION_STATUSES.REJECTED) && (
          <HandledVew data={application} />
        )}
      </Container>
      <StickyActionBar>
        {application.status === APPLICATION_STATUSES.RECEIVED && (
          <ReceivedApplicationActions application={application} />
        )}
        {(application.status === APPLICATION_STATUSES.HANDLING ||
          application.status === APPLICATION_STATUSES.INFO_REQUIRED) && (
          <HandlingApplicationActions application={application} />
        )}
      </StickyActionBar>
      <$StickyBarSpacing />
    </>
  );
};

export default ApplicationReview;
