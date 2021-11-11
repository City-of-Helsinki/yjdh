import * as React from 'react';

export type Handler = (() => Promise<void>) | (() => void) | null;

export type WizardProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  initialStep?: number;
};

export type WizardValues = {
  goToStep: (stepIndex: number) => void;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => void;
  clearStepHistory: () => void;
  handleStep: (handler: Handler) => void;
  isLoading: boolean;
  activeStep: number;
  lastCompletedStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  steps: number;
};

const WizardContext = React.createContext<WizardValues | null>(null);
WizardContext.displayName = 'WizardContext';

export default WizardContext;
