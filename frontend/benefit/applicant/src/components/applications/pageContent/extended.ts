import ApplicationContext from 'benefit/applicant/context/ApplicationContext';
import { useTranslation } from 'benefit/applicant/i18n';
import { TFunction } from 'next-i18next';
import React from 'react';
import { StepProps } from 'shared/components/stepper/Step';

type ExtendedComponentProps = {
  t: TFunction;
  handleSubmit: () => void;
  handleBack: () => void;
  steps: StepProps[];
  currentStep: number;
  hasNext: boolean;
  hasBack: boolean;
};

const useComponent = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { currentStep, setCurrentStep } = React.useContext(ApplicationContext);

  const steps = React.useMemo((): StepProps[] => {
    const applicationSteps: string[] = [
      'company',
      'hired',
      'attachments',
      'summary',
      'credentials',
      'send',
    ];
    return applicationSteps.map((step) => ({
      title: t(`common:applications.steps.${step}`),
    }));
  }, [t]);

  const hasNext = currentStep < steps.length;

  const hasBack = currentStep > 1;

  const handleSubmit = (): void => {
    const nextStep = currentStep + 1;
    if (nextStep <= steps.length) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = (): void => setCurrentStep(currentStep - 1);

  return {
    t,
    steps,
    currentStep,
    hasNext,
    hasBack,
    handleSubmit,
    handleBack,
  };
};

export { useComponent };
