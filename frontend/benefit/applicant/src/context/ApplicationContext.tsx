import noop from 'lodash/noop';
import React from 'react';

import { DEFAULT_APPLICATION } from '../constants';
import { Application } from '../types/application';

export type ApplicationContextType = {
  application: Application;
  isLoading: boolean;
  setApplication: (value: Application) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  application: DEFAULT_APPLICATION,
  isLoading: true,
  setApplication: () => noop,
});

export default ApplicationContext;
