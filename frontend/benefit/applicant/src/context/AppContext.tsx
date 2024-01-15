import noop from 'lodash/noop';
import React from 'react';

export type AppContextType = {
  isNavigationVisible: boolean;
  setIsNavigationVisible: (value: boolean) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  setIsNavigationVisible: noop,
});

export default AppContext;
