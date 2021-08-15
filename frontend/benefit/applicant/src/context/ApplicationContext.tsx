import { ApplicationTempData } from 'benefit/applicant/types/application';
import noop from 'lodash/noop';
import React from 'react';

export type ApplicationContextType = {
  applicationTempData: ApplicationTempData;
  isLoading: boolean;
  setApplicationTempData: (data: ApplicationTempData) => void;
  setCurrentStep: (currentStep: number) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  applicationTempData: {
    id: '',
    deMinimisAids: [],
    currentStep: 1,
  },
  isLoading: true,
  setApplicationTempData: () => noop,
  setCurrentStep: () => noop,
});

export default ApplicationContext;
