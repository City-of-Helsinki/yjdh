import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import { LoadingSpinner } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';

import HandlingApplicationActions from './actions/handlingApplicationActions/HandlingApplicationActions';
import ReceivedApplicationActions from './actions/receivedApplicationActions/ReceivedApplicationActions';
import BenefitView from './benefitView/BenefitView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import ConsentView from './consentView/ConsentView';
import ContactPersonView from './contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from './coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from './deminimisView/DeminimisView';
import EmployeeView from './employeeView/EmployeeView';
import EmploymenAppliedMoreView from './employmentAppliedMoreView/EmploymentAppliedMoreView';
import EmploymentView from './employmentView/EmpoymentView';
import PaySubsidyView from './paySubsidyView/PaySubsidyView';
import { useApplicationReview } from './useApplicationReview';

const ApplicationReview: React.FC = () => {
  const { application, isLoading } = useApplicationReview();

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <>
      <ApplicationHeader data={application} />
      <Container>
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
          <EmploymenAppliedMoreView />
        )}
      </Container>
      <StickyActionBar>
        {application.status === APPLICATION_STATUSES.RECEIVED && (
          <ReceivedApplicationActions application={application} />
        )}
        {application.status === APPLICATION_STATUSES.HANDLING && (
          <HandlingApplicationActions application={application} />
        )}
      </StickyActionBar>
      <$StickyBarSpacing />
    </>
  );
};

export default ApplicationReview;
