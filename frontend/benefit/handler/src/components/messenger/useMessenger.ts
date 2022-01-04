import { TFunction, useTranslation } from 'next-i18next';
import AppContext from 'benefit/handler/context/AppContext';
import React from 'react';
import { Message } from 'benefit-shared/types/application';
import { MESSAGE_TYPES } from 'benefit-shared/constants';

type ExtendedComponentProps = {
  t: TFunction;
  isMessagesDrawerVisible: boolean;
  messages: Message[];
  notes: Message[];
};

const useMessenger = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { isMessagesDrawerVisible, messages: msgs } =
    React.useContext(AppContext);

  const messages = React.useMemo(
    (): Message[] => msgs.filter((m) => m.messageType !== MESSAGE_TYPES.NOTE),
    []
  );

  const notes = React.useMemo(
    (): Message[] => msgs.filter((m) => m.messageType === MESSAGE_TYPES.NOTE),
    []
  );
  return { t, isMessagesDrawerVisible, messages, notes };
};

export { useMessenger };
