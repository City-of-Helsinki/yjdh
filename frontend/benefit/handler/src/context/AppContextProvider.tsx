import { MESSAGE_TYPES } from 'benefit-shared/constants';
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
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '12345',
      messageType: MESSAGE_TYPES.HANDLER_MESSAGE,
      modifiedAt: '13.05.2021 • 08:47',
      createdAt: '13.05.2021 • 08:47',
      content: 'This is hanlders message.',
    },
    {
      id: '123456',
      messageType: MESSAGE_TYPES.APPLICANT_MESSAGE,
      modifiedAt: '13.05.2021 • 08:47',
      createdAt: '13.05.2021 • 08:47',
      content: 'This is applicants message.',
    },
    {
      id: '1234567',
      messageType: MESSAGE_TYPES.NOTE,
      modifiedAt: '13.05.2021 • 08:47',
      createdAt: '13.05.2021 • 08:47',
      content: 'This is note.',
    },
  ]);

  return (
    <AppContext.Provider
      value={{
        layoutBackgroundColor,
        isFooterVisible,
        isNavigationVisible,
        messages,
        setIsNavigationVisible,
        setIsFooterVisible,
        setLayoutBackgroundColor,
        setMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
