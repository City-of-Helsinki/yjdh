import * as React from 'react';
import useWizard from 'shared/hooks/useWizard';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

type Props = { title: string; index?: number; lastVisitedStep?: number };

const WizardStep: React.FC<Props> = ({ title, index = 0, lastVisitedStep }) => {
  const { activeStep, goToPreviousStep, goToNextStep } = useWizard();
  const isActive = index < (lastVisitedStep ?? activeStep + 1);

  const goToStep = (): void => {
    if (index < activeStep) {
      goToPreviousStep(index);
    } else if (
      index > activeStep &&
      lastVisitedStep &&
      index < lastVisitedStep
    ) {
      void goToNextStep(index);
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
