import useStepStorage from 'kesaseteli/employer/hooks/application/useStepStorage';
import useMountEffect from 'shared/hooks/useMountEffect';

const useSetCurrentStep = (step: number): void => {
  const [,setCurrentStep] = useStepStorage('current')
  const [lastVisitedStep,setLastVisitedStep] = useStepStorage('last-visited')
  useMountEffect(() => {
    setCurrentStep(step);
    if (!lastVisitedStep || lastVisitedStep < step) {
      setLastVisitedStep(step);
    }
  });
};

export default useSetCurrentStep;
