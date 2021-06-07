import StepperActions from 'benefit/applicant/components/applications/forms/application/stepperActions/StepperActions';
import {
  StyledHeaderItem,
  StyledPageHeader,
  StyledPageHeading,
} from 'benefit/applicant/components/applications/styled';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';
import Container from 'shared/components/container/Container';
import Stepper from 'shared/components/stepper/Stepper';

import { useComponent } from './extended';

const PageContent = (): React.ReactElement => {
  const {
    handleSubmit,
    handleBack,
    t,
    steps,
    currentStep,
    hasBack,
    hasNext,
  } = useComponent();

  const DynamicFormStepComponent: ComponentType<DynamicFormStepComponentProps> = dynamic(
    () =>
      import(
        `benefit/applicant/components/applications/forms/application/step${currentStep}/ApplicationFormStep${currentStep}`
      )
  );

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
      <DynamicFormStepComponent
        actions={
          <StepperActions
            hasBack={hasBack}
            hasNext={hasNext}
            handleSubmit={handleSubmit}
            handleBack={handleBack}
          />
        }
      />
    </Container>
  );
};

export default PageContent;
