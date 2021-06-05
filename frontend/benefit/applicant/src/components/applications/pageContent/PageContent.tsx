// todo:next dynamic does not have isLoading, so the action buttons are jumping on dynamic load
import ApplicationFormStep1 from 'benefit/applicant/components/applications/forms/application/step1/ApplicationFormStep1';
import ApplicationFormStep2 from 'benefit/applicant/components/applications/forms/application/step2/ApplicationFormStep2';
import ApplicationFormStep3 from 'benefit/applicant/components/applications/forms/application/step3/ApplicationFormStep3';
import ApplicationFormStep4 from 'benefit/applicant/components/applications/forms/application/step4/ApplicationFormStep4';
import ApplicationFormStep5 from 'benefit/applicant/components/applications/forms/application/step5/ApplicationFormStep5';
import ApplicationFormStep6 from 'benefit/applicant/components/applications/forms/application/step6/ApplicationFormStep6';
import {
  StyledApplicationAction,
  StyledApplicationActions,
  StyledHeaderItem,
  StyledPageHeader,
  StyledPageHeading,
  StyledPrimaryButton,
  StyledSecondaryButton,
  StyledSupplementaryButton,
} from 'benefit/applicant/components/applications/styled';
import { IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Stepper from 'shared/components/stepper/Stepper';

import { useComponent } from './extended';

const PageContent = (): JSX.Element => {
  const {
    handleSubmit,
    handleBack,
    t,
    steps,
    currentStep,
    hasBack,
    hasNext,
  } = useComponent();

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
      {currentStep === 1 && <ApplicationFormStep1 />}
      {currentStep === 2 && <ApplicationFormStep2 />}
      {currentStep === 3 && <ApplicationFormStep3 />}
      {currentStep === 4 && <ApplicationFormStep4 />}
      {currentStep === 5 && <ApplicationFormStep5 />}
      {currentStep === 6 && <ApplicationFormStep6 />}
      <StyledApplicationActions>
        <StyledApplicationAction>
          {hasBack && (
            <StyledSecondaryButton
              variant="secondary"
              iconLeft={<IconArrowLeft />}
              onClick={handleBack}
            >
              {t('common:applications.actions.back')}
            </StyledSecondaryButton>
          )}
        </StyledApplicationAction>
        <StyledApplicationAction>
          <StyledSecondaryButton variant="secondary">
            {t('common:applications.actions.saveAndContinueLater')}
          </StyledSecondaryButton>
          <StyledSupplementaryButton
            variant="supplementary"
            iconLeft={<IconCross />}
          >
            {t('common:applications.actions.deleteApplication')}
          </StyledSupplementaryButton>
        </StyledApplicationAction>
        <StyledApplicationAction>
          <StyledPrimaryButton
            iconRight={<IconArrowRight />}
            onClick={handleSubmit}
          >
            {hasNext
              ? t('common:applications.actions.continue')
              : t('common:applications.actions.send')}
          </StyledPrimaryButton>
        </StyledApplicationAction>
      </StyledApplicationActions>
    </Container>
  );
};

export default PageContent;
