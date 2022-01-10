import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { Message, MessageData } from 'benefit-shared/types/application';
import { MESSAGE_TYPES } from 'benefit-shared/constants';
import useMessagesQuery from 'benefit/handler/hooks/useMessagesQuery';
import { useRouter } from 'next/router';
import camelcaseKeys from 'camelcase-keys';

type ExtendedComponentProps = {
  t: TFunction;
  messages: Message[];
  notes: Message[];
};

const useMessenger = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const applicationId = router.query.id ?? '';
  const { data } = useMessagesQuery(applicationId.toString());

  const msgs = data?.map(
    (message: MessageData): Message => camelcaseKeys(message)
  );

  const messages = React.useMemo(
    (): Message[] =>
      msgs?.filter((m) => m.messageType !== MESSAGE_TYPES.NOTE) || [],
    [msgs]
  );

  const notes = React.useMemo(
    (): Message[] =>
      msgs?.filter((m) => m.messageType === MESSAGE_TYPES.NOTE) || [],
    [msgs]
  );
  return { t, messages, notes };
};

export { useMessenger };
