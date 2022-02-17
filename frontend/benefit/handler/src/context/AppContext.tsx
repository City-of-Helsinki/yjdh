import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

import { HandledAplication } from '../types/application';

export type AppContextType = {
  isNavigationVisible: boolean;
  isFooterVisible: boolean;
  layoutBackgroundColor: string;
  handledApplication: HandledAplication | null;
  setIsNavigationVisible: (value: boolean) => void;
  setIsFooterVisible: (value: boolean) => void;
  setLayoutBackgroundColor: (value: string) => void;
  setHandledApplication: (handledApplication: HandledAplication | null) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  isFooterVisible: true,
  layoutBackgroundColor: theme.colors.white,
  handledApplication: null,
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
  setHandledApplication: noop,
});

export default AppContext;
