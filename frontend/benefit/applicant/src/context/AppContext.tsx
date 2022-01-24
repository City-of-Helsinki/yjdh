import noop from 'lodash/noop';
import React from 'react';

import { SubmittedApplication } from '../types/application';

export type AppContextType = {
  hasMessenger: boolean;
  submittedApplication: SubmittedApplication | null;
  setSubmittedApplication: (value: SubmittedApplication | null) => void;
  setHasMessenger: (value: boolean) => void;
};

const AppContext = React.createContext<AppContextType>({
  hasMessenger: false,
  setHasMessenger: noop,
  submittedApplication: null,
  setSubmittedApplication: noop,
});

export default AppContext;
