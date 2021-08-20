import React from 'react';
import { StepProps } from 'shared/components/stepper/Step';
import Stepper from 'shared/components/stepper/Stepper';
import Container from 'shared/components/container/Container';
import Wizard from 'shared/components/wizard/Wizard';

import { $Header, $HeaderItem, $Heading } from './ApplicationWizard.sc';

type WizardProps = {
  steps: Array<StepProps>;
  currentStep: number;
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode | undefined;
};

const ApplicationWizard: React.FC<WizardProps> = ({
  steps,
  currentStep,
  header,
  children,
  footer,
}: WizardProps) => {
  const Header = (
    <$Header>
      <$HeaderItem>
        <$Heading>{header}</$Heading>
      </$HeaderItem>
      <$HeaderItem>
        <Stepper steps={steps} activeStep={currentStep} />
      </$HeaderItem>
    </$Header>
  );

  return (
    <Container>
      <Wizard header={Header} footer={footer} initialStep={currentStep}>
        {children}
      </Wizard>
    </Container>
  );
};

export default ApplicationWizard;
