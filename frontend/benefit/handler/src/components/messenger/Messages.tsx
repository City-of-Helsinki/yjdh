import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import camelCase from 'lodash/camelCase';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import MessageComponent from 'shared/components/messaging/Message';
import { $MessagesList } from 'shared/components/messaging/Messaging.sc';

interface ComponentProps {
  data: Message[];
}

const Messages: React.FC<ComponentProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <$MessagesList>
      {data.map((message) => (
        <MessageComponent
          key={message.id}
          sender={t(
            `common:messenger.titles.${camelCase(message.messageType)}`
          )}
          date={message.modifiedAt}
          text={message.content}
          isPrimary={message.messageType === MESSAGE_TYPES.HANDLER_MESSAGE}
        />
      ))}
    </$MessagesList>
  );
};

export default Messages;
