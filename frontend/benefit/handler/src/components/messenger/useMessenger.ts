import useCreateMessageQuery from 'benefit/handler/hooks/useCreateMessageQuery';
import useMessagesQuery from 'benefit/handler/hooks/useMessagesQuery';
import { MESSAGE_TYPES, MESSAGE_URLS } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import usePolling from 'shared/hooks/usePolling';

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
  const { data: messages, refetch: refetchMessages } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.MESSAGES
  );
  const { data: notes, refetch: refetchNotes } = useMessagesQuery(
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

  const doPolling = React.useCallback((): void => {
    void refetchMessages();
    void refetchNotes();
  }, [refetchMessages, refetchNotes]);

  // refetch messages and notes every 30 seconds
  usePolling(doPolling, 30_000);

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
  };
};

export { useMessenger };
