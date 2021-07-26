import { DeMinimisAid } from 'benefit/applicant/types/application';
import noop from 'lodash/noop';
import React from 'react';

export type ApplicationContextType = {
  applicationId: string;
  currentStep: number;
  deMinimisAids: DeMinimisAid[];
  isLoading: boolean;
  setApplicationId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  setDeMinimisAids: (value: DeMinimisAid[]) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  applicationId: '',
  currentStep: 1,
  deMinimisAids: [],
  isLoading: true,
  setApplicationId: () => noop,
  setCurrentStep: () => noop,
  setDeMinimisAids: () => noop,
});

export default ApplicationContext;
