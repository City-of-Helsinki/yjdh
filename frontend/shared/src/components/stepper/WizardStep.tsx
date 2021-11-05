import { useTranslation } from 'next-i18next';
import * as React from 'react';
import useWizard from 'shared/hooks/useWizard';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

type Props = { title: string; index?: number; lastVisitedStep?: number };

const WizardStep: React.FC<Props> = ({ title, index = 0, lastVisitedStep }) => {
  const { t } = useTranslation();
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
    <$StepContainer
      onClick={goToStep}
      isActive={isActive}
      role="button"
      aria-disabled={!isActive}
      aria-label={`${t('common:application.wizardStepButton')} ${t(
        `common:application.step${index + 1}.header`
      )}`}
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          goToStep();
        }
      }}
    >
      <$StepCircle isActive={isActive}>{index + 1}</$StepCircle>
      <$StepTitle isActive={isActive}>{title}</$StepTitle>
    </$StepContainer>
  );
};

WizardStep.defaultProps = {
  index: 0,
  lastVisitedStep: 1,
};

export default WizardStep;
