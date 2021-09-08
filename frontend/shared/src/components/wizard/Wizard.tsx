import React from 'react';
import WizardContext, {
  Handler,
  WizardProps,
} from 'shared/contexts/WizardContext';

/**
 * Common wizard component allowing steps added as child components.
 * Loosely based on https://github.com/devrnt/react-use-wizard
 */
const Wizard: React.FC<WizardProps> = React.memo(
  ({ initialStep = 1, header, children, footer }) => {
    const [activeStep, setActiveStep] = React.useState<number>(initialStep - 1);
    const [isLoading, setIsLoading] = React.useState(false);
    const hasNextStep = React.useRef(true);
    const hasPreviousStep = React.useRef(false);
    const nextStepHandler = React.useRef<Handler>(() => {});

    hasNextStep.current =
      activeStep < React.Children.toArray(children).length - 1;
    hasPreviousStep.current = activeStep > 0;

    const goToNextStep = React.useRef((stepIndex?: number) => {
      if (hasNextStep.current || stepIndex) {
        setActiveStep((step) => stepIndex ?? step + 1);
      }
    });

    const goToPreviousStep = React.useRef((stepIndex?: number) => {
      if (hasPreviousStep.current || stepIndex) {
        setActiveStep((step) => stepIndex ?? step - 1);
      }
    });

    // Callback to attach the step handler
    const handleStep = React.useRef((handler: Handler) => {
      nextStepHandler.current = handler;
    });

    const doNextStep = React.useRef(async (stepIndex?: number) => {
      if (hasNextStep.current && nextStepHandler.current) {
        try {
          setIsLoading(true);
          await nextStepHandler.current();
          setIsLoading(false);
          nextStepHandler.current = null;
          goToNextStep.current(stepIndex);
        } catch (error) {
          setIsLoading(false);
          throw error;
        }
      } else {
        goToNextStep.current(stepIndex);
      }
    });

    const steps = React.Children.toArray(children).length;
    const wizardValue = React.useMemo(
      () => ({
        nextStep: doNextStep.current,
        previousStep: goToPreviousStep.current,
        handleStep: handleStep.current,
        isLoading,
        activeStep,
        isFirstStep: !hasPreviousStep.current,
        isLastStep: !hasNextStep.current,
        steps,
      }),
      [activeStep, isLoading, steps]
    );

    const activeStepContent = React.useMemo(() => {
      const reactChildren = React.Children.toArray(children);
      return reactChildren[activeStep];
    }, [activeStep, children]);
    return (
      <WizardContext.Provider value={wizardValue}>
        {header}
        {activeStepContent}
        {footer}
      </WizardContext.Provider>
    );
  }
);

export default Wizard;
