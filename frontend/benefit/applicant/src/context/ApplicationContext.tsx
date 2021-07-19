import noop from 'lodash/noop';
import React from 'react';

import { DEFAULT_APPLICATION } from '../constants';
import { Application } from '../types/application';

export type ApplicationContextType = {
  currentStep: number;
  application: Application;
  isLoading: boolean;
  setCurrentStep: (value: number) => void;
  setApplication: (value: Application) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  currentStep: 1,
  application: DEFAULT_APPLICATION,
  isLoading: true,
  setCurrentStep: () => noop,
  setApplication: () => noop,
});

export default ApplicationContext;
