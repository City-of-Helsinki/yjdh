import { Application } from 'benefit-shared/types/application';
import * as React from 'react';
import Container from 'shared/components/container/Container';

type ApplicationReviewStepProps = {
  application: Application;
};

const ApplicationReviewStep3: React.FC<ApplicationReviewStepProps> = ({
  application,
}) => (
  <Container>{JSON.stringify(application.decisionProposalDraft)}</Container>
);

export default ApplicationReviewStep3;
