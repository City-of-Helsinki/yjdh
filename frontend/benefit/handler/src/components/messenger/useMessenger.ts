import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import useCreateMessageQuery from 'benefit/handler/hooks/useCreateMessageQuery';
import useCreateNoteQuery from 'benefit/handler/hooks/useCreateNoteQuery';
import useMessagesQuery from 'benefit/handler/hooks/useMessagesQuery';
import useNotesQuery from 'benefit/handler/hooks/useNotesQuery';
import { TFunction, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React from 'react';
import { mapMessages } from './utility';

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
  const { data: messagesData } = useMessagesQuery(applicationId.toString());
  const { data: notesData } = useNotesQuery(applicationId.toString());

  const { mutateAsync: createMessage } = useCreateMessageQuery(
    applicationId.toString()
  );
  const { mutateAsync: createNote } = useCreateNoteQuery(
    applicationId.toString()
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

  return { t, messages, notes, handleSendMessage, handleCreateNote };
};

export { useMessenger };
