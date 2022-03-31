import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import { IconSpeechbubble } from 'hds-react';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import MessageComponent from 'shared/components/messaging/Message';
import {
  $Empty,
  $MessagesList,
} from 'shared/components/messaging/Messaging.sc';
import { MessageVariant } from 'shared/types/messages';

interface ComponentProps {
  data: Message[];
  variant: MessageVariant;
  withScroll?: boolean;
}

const Messages: React.FC<ComponentProps> = ({ data, variant, withScroll }) => {
  const { t } = useTranslation();
  const scrollMessagesRef = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    scrollMessagesRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data, scrollMessagesRef]);

  return (
    <$MessagesList variant={variant}>
      {data.map((message) => (
        <MessageComponent
          key={message.id}
          sender={
            message.messageType === MESSAGE_TYPES.NOTE
              ? message.sender ?? ''
              : t(`common:messenger.titles.${camelCase(message.messageType)}`)
          }
          date={message.modifiedAt || ''}
          text={message.content}
          isPrimary={message.messageType === MESSAGE_TYPES.APPLICANT_MESSAGE}
          variant={variant}
        />
      ))}
      {data.length === 0 && (
        <$Empty>
          <IconSpeechbubble />
          <p>{t('common:messenger.noMessages')}</p>
        </$Empty>
      )}
      {withScroll && <div ref={scrollMessagesRef} />}
    </$MessagesList>
  );
};

Messages.defaultProps = {
  withScroll: false,
};

export default Messages;
