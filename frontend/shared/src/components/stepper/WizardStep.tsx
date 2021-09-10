import * as React from 'react';
import useWizard from 'shared/hooks/useWizard';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

export type StepProps = { title: string; index?: number; activeStep?: number };

const WizardStep = ({ title, index = 0 }: StepProps): React.ReactElement => {
  const { activeStep, previousStep } = useWizard();
  const isActive = index < activeStep + 1;

  const goToStep = (): void => {
    if (index < activeStep) {
      previousStep(index);
    }
  };

  return (
    <$StepContainer onClick={goToStep} isActive={isActive}>
      <$StepCircle isActive={isActive}>{index + 1}</$StepCircle>
      <$StepTitle isActive={isActive}>{title}</$StepTitle>
    </$StepContainer>
  );
};

export default WizardStep;
