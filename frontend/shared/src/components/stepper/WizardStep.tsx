import * as React from 'react';
import useWizard from 'shared/hooks/useWizard';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

type Props = { title: string; index?: number };

const WizardStep: React.FC<Props> = ({ title, index = 0 }) => {
  const { activeStep, lastCompletedStep, goToStep } = useWizard();
  const lastCompleted = lastCompletedStep ?? activeStep - 1;
  const isActive = index <= lastCompleted + 1;

  const goToIndexStep = (): void => {
    if (index <= lastCompleted + 1) {
      void goToStep(index);
    }
  };

  return (
    <$StepContainer onClick={goToIndexStep} isActive={isActive}>
      <$StepCircle isActive={isActive}>{index + 1}</$StepCircle>
      <$StepTitle isActive={isActive}>{title}</$StepTitle>
    </$StepContainer>
  );
};

export default WizardStep;
