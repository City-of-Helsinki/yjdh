import useStepStorage from 'kesaseteli/employer/hooks/wizard/useStepStorage';
import React from 'react';

const useSaveCurrentStepEffect = (currentStep: number): void => {
  const [, saveCurrentStep] = useStepStorage('current');

  React.useEffect(
    () => saveCurrentStep(currentStep - 1),
    [saveCurrentStep, currentStep]
  );
};

export default useSaveCurrentStepEffect;
