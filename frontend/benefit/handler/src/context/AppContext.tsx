import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

export type AppContextType = {
  isNavigationVisible: boolean;
  setIsNavigationVisible: (value: boolean) => void;
  layoutBackgroundColor: string;
  setLayoutBackgroundColor: (value: string) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  layoutBackgroundColor: theme.colors.white,
  setIsNavigationVisible: noop,
  setLayoutBackgroundColor: noop,
});

export default AppContext;
