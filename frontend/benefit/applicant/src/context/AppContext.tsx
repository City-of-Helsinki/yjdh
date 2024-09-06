import noop from 'lodash/noop';
import React from 'react';

export type AppContextType = {
  isNavigationVisible: boolean;
  isSidebarVisible: boolean;
  setIsNavigationVisible: (value: boolean) => void;
  setIsSidebarVisible: (value: boolean) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  isSidebarVisible: false,
  setIsNavigationVisible: noop,
  setIsSidebarVisible: noop,
});

export default AppContext;
