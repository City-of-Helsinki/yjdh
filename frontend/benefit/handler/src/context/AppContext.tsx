import { Message } from 'benefit-shared/types/application';
import noop from 'lodash/noop';
import React from 'react';
import theme from 'shared/styles/theme';

export type AppContextType = {
  isNavigationVisible: boolean;
  isFooterVisible: boolean;
  layoutBackgroundColor: string;
  messages: Message[];
  isMessagesDrawerVisible: boolean;
  setIsNavigationVisible: (value: boolean) => void;
  setIsFooterVisible: (value: boolean) => void;
  setLayoutBackgroundColor: (value: string) => void;
  setIsMessagesDrawerVisible: (value: boolean) => void;
  setMessages: (value: Message[]) => void;
};

const AppContext = React.createContext<AppContextType>({
  isNavigationVisible: false,
  isFooterVisible: true,
  layoutBackgroundColor: theme.colors.white,
  isMessagesDrawerVisible: false,
  messages: [],
  setIsNavigationVisible: noop,
  setIsFooterVisible: noop,
  setLayoutBackgroundColor: noop,
  setIsMessagesDrawerVisible: noop,
  setMessages: noop,
});

export default AppContext;
