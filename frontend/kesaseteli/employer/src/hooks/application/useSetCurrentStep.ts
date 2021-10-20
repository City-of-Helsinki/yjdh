import useStepStorage from 'kesaseteli/employer/hooks/application/useStepStorage';
import useMountEffect from 'shared/hooks/useMountEffect';

const useSetCurrentStep = (step: number): void => {
  const [,setCurrentStep] = useStepStorage('current')
  const [lastStep,setLastStep] = useStepStorage('last-visited')
  useMountEffect(() => {
    setCurrentStep(step);
    if (!lastStep || lastStep < step) {
      setLastStep(step);
    }
  });
};

export default useSetCurrentStep;
