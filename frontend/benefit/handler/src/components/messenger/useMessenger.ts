import useCreateMessageQuery from 'benefit/handler/hooks/useCreateMessageQuery';
import useMessagesQuery from 'benefit/handler/hooks/useMessagesQuery';
import { mapMessages } from 'benefit/handler/utils/common';
import { MESSAGE_TYPES, MESSAGE_URLS } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';

type ExtendedComponentProps = {
  t: TFunction;
  messages: Message[];
  notes: Message[];
  handleSendMessage: (message: string) => void;
  handleCreateNote: (note: string) => void;
};

const useMessenger = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const applicationId = router.query.id ?? '';
  const { data: messagesData } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.MESSAGES
  );
  const { data: notesData } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );

  const { mutate: createMessage } = useCreateMessageQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );
  const { mutateAsync: createNote } = useCreateMessageQuery(
    applicationId.toString(),
    MESSAGE_URLS.NOTES
  );

  const messages = React.useMemo(
    (): Message[] => mapMessages(messagesData),
    [messagesData]
  );

  const notes = React.useMemo(
    (): Message[] => mapMessages(notesData),
    [notesData]
  );

  const handleSendMessage = (message: string): void =>
    void createMessage({
      message_type: MESSAGE_TYPES.HANDLER_MESSAGE,
      content: message,
    });

  const handleCreateNote = (note: string): void =>
    void createNote({
      message_type: MESSAGE_TYPES.NOTE,
      content: note,
    });

  return {
    t,
    messages,
    notes,
    handleSendMessage,
    handleCreateNote,
  };
};

export { useMessenger };
