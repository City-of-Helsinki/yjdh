import * as React from 'react';

export type Handler = (() => Promise<void>) | (() => void) | null;

export type WizardProps = {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  initialStep?: number;
};

export type WizardValues = {
  nextStep: (stepIndex?: number) => Promise<void>;
  previousStep: (stepIndex?: number) => void;
  handleStep: (handler: Handler) => void;
  isLoading: boolean;
  activeStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  steps: number;
};

const WizardContext = React.createContext<WizardValues | null>(null);
WizardContext.displayName = 'WizardContext';

export default WizardContext;
