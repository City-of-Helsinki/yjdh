import noop from 'lodash/noop';
import React from 'react';

export type FrontPageContextType = {
  errors: Error[];
  setError: (value: Error) => void;
};

const FrontPageContext = React.createContext<FrontPageContextType>({
  errors: [],
  setError: noop,
});

export default FrontPageContext;
