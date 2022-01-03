import { Message } from 'benefit-shared/types/application';
import React from 'react';

import AppContext from './AppContext';

const AppContextProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): JSX.Element => {
  const [isFooterVisible, setIsFooterVisible] = React.useState<boolean>(false);
  const [isNavigationVisible, setIsNavigationVisible] =
    React.useState<boolean>(false);
  const [layoutBackgroundColor, setLayoutBackgroundColor] =
    React.useState<string>('');
  const [isMessagesDrawerVisible, setIsMessagesDrawerVisible] =
    React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>([]);

  return (
    <AppContext.Provider
      value={{
        layoutBackgroundColor,
        isFooterVisible,
        isNavigationVisible,
        isMessagesDrawerVisible,
        messages,
        setIsNavigationVisible,
        setIsFooterVisible,
        setLayoutBackgroundColor,
        setIsMessagesDrawerVisible,
        setMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
