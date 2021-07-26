import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1';
import ApplicationFormStep2 from 'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2';
import ApplicationFormStep3 from 'benefit/applicant/components/applications/forms/application/step3/ApplicationFormStep3';
import ApplicationFormStep4 from 'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4';
import ApplicationFormStep5 from 'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5';
import ApplicationFormStep6 from 'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6';
import {
  StyledHeaderItem,
  StyledPageHeader,
  StyledPageHeading,
} from 'benefit/applicant/components/applications/styled';
import React from 'react';
import Container from 'shared/components/container/Container';
import Stepper from 'shared/components/stepper/Stepper';

import { usePageContent } from './usePageContent';

const PageContent: React.FC = () => {
  const { t, steps, currentStep, application } = usePageContent();

  return (
    <Container>
      <StyledPageHeader>
        <StyledHeaderItem>
          <StyledPageHeading>
            {t('common:applications.pageHeaders.new')}
          </StyledPageHeading>
        </StyledHeaderItem>
        <StyledHeaderItem>
          <Stepper steps={steps} activeStep={currentStep} />
        </StyledHeaderItem>
      </StyledPageHeader>
      {currentStep === 1 && <ApplicationFormStep1 data={application} />}
      {currentStep === 2 && <ApplicationFormStep2 data={application} />}
      {currentStep === 3 && <ApplicationFormStep3 />}
      {currentStep === 4 && <ApplicationFormStep4 />}
      {currentStep === 5 && <ApplicationFormStep5 />}
      {currentStep === 6 && <ApplicationFormStep6 />}
    </Container>
  );
};

export default PageContent;
