import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

export type AppContextType = {
  isNavigationVisible: boolean;
  isFooterVisible: boolean;
  layoutBackgroundColor: string;
  setIsNavigationVisible: (value: boolean) => void;
  setIsFooterVisible: (value: boolean) => void;
  setLayoutBackgroundColor: (value: string) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  isFooterVisible: true,
  layoutBackgroundColor: theme.colors.white,
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
});

export default AppContext;
