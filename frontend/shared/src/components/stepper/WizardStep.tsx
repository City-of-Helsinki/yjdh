import { useTranslation } from 'next-i18next';
import * as React from 'react';
import useWizard from 'shared/hooks/useWizard';

import { $StepCircle, $StepContainer, $StepTitle } from './Stepper.sc';

type Props = { title: string; index?: number };

const WizardStep: React.FC<Props> = ({ title, index = 0 }) => {
  const { t } = useTranslation();
  const { activeStep, lastCompletedStep, goToStep } = useWizard();
  const lastCompleted = lastCompletedStep ?? activeStep - 1;
  const isActive = index <= lastCompleted + 1;

  const goToIndexStep = (): void => {
    if (index <= lastCompleted + 1) {
      void goToStep(index);
    }
  };

  return (
    <$StepContainer
      onClick={goToIndexStep}
      isActive={isActive}
      role="button"
      aria-disabled={!isActive}
      aria-label={`${t('common:application.wizardStepButton')} ${t(
        `common:application.step${index + 1}.header`
      )}`}
      tabIndex={0}
      onKeyPress={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          goToIndexStep();
        }
      }}
    >
      <$StepCircle isActive={isActive}>{index + 1}</$StepCircle>
      <$StepTitle isActive={isActive}>{title}</$StepTitle>
    </$StepContainer>
  );
};

export default WizardStep;
