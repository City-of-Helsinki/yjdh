import useCreateMessageQuery from 'benefit/handler/hooks/useCreateMessageQuery';
import useMarkLastMessageUnreadQuery from 'benefit/handler/hooks/useMarkLastMessageUnreadQuery';
import useMarkMessagesReadQuery from 'benefit/handler/hooks/useMarkMessagesReadQuery';
import useMessagesQuery from 'benefit/handler/hooks/useMessagesQuery';
import { MESSAGE_TYPES, MESSAGE_URLS } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { UseMutateFunction } from 'react-query';

type ExtendedComponentProps = {
  t: TFunction;
  messages: Message[];
  notes: Message[];
  handleSendMessage: (message: string) => void;
  handleCreateNote: (note: string) => void;
  handleMarkMessagesRead: UseMutateFunction<void, Error>;
  handleMarkLastMessageUnread: UseMutateFunction<void, Error>;
};

const useSidebar = (applicationId: string): ExtendedComponentProps => {
  const { t } = useTranslation();
  const { data: messages } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.MESSAGES
  );
  const { data: notes } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );

  const { mutate: createMessage } = useCreateMessageQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );
  const { mutate: createNote } = useCreateMessageQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );

  const { mutate: markMessagesRead } = useMarkMessagesReadQuery(
    applicationId.toString()
  );

  const { mutate: markLastMessageUnread } = useMarkLastMessageUnreadQuery(
    applicationId.toString()
  );

  const handleSendMessage = (message: string): void =>
    createMessage({
      message_type: MESSAGE_TYPES.HANDLER_MESSAGE,
      content: message,
    });

  const handleCreateNote = (note: string): void =>
    createNote({
      message_type: MESSAGE_TYPES.NOTE,
      content: note,
    });

  return {
    t,
    messages: messages || [],
    notes: notes || [],
    handleSendMessage,
    handleCreateNote,
    handleMarkMessagesRead: markMessagesRead,
    handleMarkLastMessageUnread: markLastMessageUnread,
  };
};

export { useSidebar };
