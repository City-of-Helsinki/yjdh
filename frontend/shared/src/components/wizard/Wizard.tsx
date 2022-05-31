import { LoadingSpinner } from 'hds-react';
import React from 'react';
import { $HiddenLoadingIndicator } from 'shared/components/hidden-loading-indicator/HiddenLoadingIndicator.sc';
import WizardContext, {
  Handler,
  WizardProps,
} from 'shared/contexts/WizardContext';

type Step = {
  active: number;
  lastCompleted?: number;
};

/**
 * Common wizard component allowing steps added as child components.
 * Loosely based on https://github.com/devrnt/react-use-wizard
 */
const Wizard: React.FC<WizardProps> = React.memo(
  // eslint-disable-next-line sonarjs/cognitive-complexity
  ({ initialStep = 0, header, children, footer }) => {
    const [step, setStep] = React.useState<Step>({
      active: initialStep,
      lastCompleted: initialStep - 1,
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const nextStepHandler = React.useRef<Handler>(() => {});
    const hasNextStep =
      step.active < React.Children.toArray(children).length - 1;
    const hasPreviousStep = step.active > 0;

    const clearStepHistory = React.useCallback(() => {
      setStep({ active: step.active, lastCompleted: step.active - 1 });
    }, [step, setStep]);

    const goToStep = React.useCallback(
      (stepIndex: number) => {
        setStep({ active: stepIndex, lastCompleted: step.lastCompleted });
      },
      [step, setStep]
    );

    const goToNextStep = React.useCallback(() => {
      if (hasNextStep) {
        const currentStep = step.active;
        const nextStep = currentStep + 1;
        let lastCompleted = step.lastCompleted ?? -1;
        if (lastCompleted < currentStep) {
          lastCompleted = currentStep;
        }
        setStep({ active: nextStep, lastCompleted });
        window.scrollTo(0, 0);
      }
    }, [step, hasNextStep, setStep]);

    const goToPreviousStep = React.useCallback(() => {
      if (hasPreviousStep) {
        setStep({ active: step.active - 1, lastCompleted: step.lastCompleted });
        window.scrollTo(0, 0);
      }
    }, [hasPreviousStep, step.active, step.lastCompleted]);

    // Callback to attach the step handler
    const handleStep = React.useRef((handler: Handler) => {
      nextStepHandler.current = handler;
    });

    const doNextStep = React.useCallback(async () => {
      if (hasNextStep && nextStepHandler.current) {
        try {
          setIsLoading(true);
          await nextStepHandler.current();
          setIsLoading(false);
          nextStepHandler.current = null;
          goToNextStep();
        } catch (error) {
          setIsLoading(false);
          throw error;
        }
      } else {
        goToNextStep();
      }
    }, [hasNextStep, nextStepHandler, setIsLoading, goToNextStep]);

    const steps = React.useMemo(
      () => React.Children.toArray(children).length,
      [children]
    );
    const wizardValue = React.useMemo(
      () => ({
        goToStep,
        goToNextStep: doNextStep,
        goToPreviousStep,
        handleStep: handleStep.current,
        clearStepHistory,
        isLoading,
        activeStep: step.active,
        lastCompletedStep: step.lastCompleted ?? -1,
        isFirstStep: !hasPreviousStep,
        isLastStep: !hasNextStep,
        steps,
      }),
      [
        clearStepHistory,
        doNextStep,
        goToPreviousStep,
        goToStep,
        hasNextStep,
        hasPreviousStep,
        isLoading,
        step.active,
        step.lastCompleted,
        steps,
      ]
    );

    const activeStepContent = React.useMemo(() => {
      const reactChildren = React.Children.toArray(children);
      return reactChildren[step.active];
    }, [step, children]);
    return (
      <WizardContext.Provider value={wizardValue}>
        {header}
        {isLoading ? (
          <$HiddenLoadingIndicator>
            <LoadingSpinner data-testid="hidden-loading-indicator" />
          </$HiddenLoadingIndicator>
        ) : (
          activeStepContent
        )}
        {footer}
      </WizardContext.Provider>
    );
  }
);

export default Wizard;
