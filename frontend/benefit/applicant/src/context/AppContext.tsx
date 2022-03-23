import noop from 'lodash/noop';
import React from 'react';

import { SubmittedApplication } from '../types/application';

export type AppContextType = {
  submittedApplication: SubmittedApplication | null;
  setSubmittedApplication: (value: SubmittedApplication | null) => void;
};

const AppContext = React.createContext<AppContextType>({
  submittedApplication: null,
  setSubmittedApplication: noop,
});

export default AppContext;
