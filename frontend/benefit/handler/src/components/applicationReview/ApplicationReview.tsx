import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { Button, LoadingSpinner } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import ReviewSection from '../reviewSection/ReviewSection';
import BenefitView from './benefitView/BenefitView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import ContactPersonView from './contactPersonView/ContactPersonView';
import CoOperationNegotiationsView from './coOperationNegotiationsView/CoOperationNegotiationsView';
import DeminimisView from './deminimisView/DeminimisView';
import EmployeeView from './employeeView/EmployeeView';
import EmploymentView from './employmentView/EmpoymentView';
import PaySubsidyView from './paySubsidyView/PaySubsidyView';
import { useApplicationReview } from './useApplicationReview';

const ApplicationReview: React.FC = () => {
  const { t, application, isLoading } = useApplicationReview();

  const translationBase = 'common:review.headings';

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
        <ReviewSection
          action={
            <div>
              <Button theme="black" variant="secondary">
                Some button
              </Button>
            </div>
          }
          header={t(`${translationBase}.heading9`)}
        >
          <$GridCell $colSpan={12}>Section contents9</$GridCell>
        </ReviewSection>
        <ReviewSection withMargin>
          <$GridCell $colSpan={12}>Section contents10</$GridCell>
        </ReviewSection>
      </Container>
    </>
  );
};

export default ApplicationReview;
