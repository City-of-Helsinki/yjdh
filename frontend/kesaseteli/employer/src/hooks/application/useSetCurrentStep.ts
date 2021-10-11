import { getStepNumber } from 'kesaseteli/employer/utils/application-wizard.utils';
import useSetQueryParam from 'shared/hooks/useSetQueryParam';
import useWizard from 'shared/hooks/useWizard';

const useSetCurrentStep = (): void => {
  const { activeStep } = useWizard();
  const currentStep = getStepNumber(activeStep + 1);
  useSetQueryParam('step', String(currentStep));
};

export default useSetCurrentStep;
