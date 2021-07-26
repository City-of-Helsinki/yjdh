import noop from 'lodash/noop';
import React from 'react';

import { DEFAULT_APPLICATION } from '../constants';
import { Application, DeMinimisAid } from '../types/application';

export type ApplicationContextType = {
  application: Application;
  deMinimisAids: DeMinimisAid[];
  isLoading: boolean;
  setApplication: (value: Application) => void;
  setDeMinimisAids: (value: DeMinimisAid[]) => void;
};

const ApplicationContext = React.createContext<ApplicationContextType>({
  application: DEFAULT_APPLICATION as Application,
  deMinimisAids: [],
  isLoading: true,
  setApplication: () => noop,
  setDeMinimisAids: () => noop,
});

export default ApplicationContext;
