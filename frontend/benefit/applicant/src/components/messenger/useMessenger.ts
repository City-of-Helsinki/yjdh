import useCreateMessageQuery from 'benefit/applicant/hooks/useCreateMessageQuery';
import useMessagesQuery from 'benefit/applicant/hooks/useMessagesQuery';
import { MESSAGE_TYPES, MESSAGE_URLS } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';

type ExtendedComponentProps = {
  t: TFunction;
  messages: Message[];
  handleSendMessage: (message: string) => void;
};

const useMessenger = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const applicationId = router.query.id ?? '';
  const { data: messages } = useMessagesQuery(
    applicationId.toString(),
    MESSAGE_URLS.MESSAGES
  );

  const { mutate: createMessage } = useCreateMessageQuery(
    applicationId.toString(),
    MESSAGE_URLS.MESSAGES
  );

  const handleSendMessage = (message: string): void =>
    createMessage({
      message_type: MESSAGE_TYPES.APPLICANT_MESSAGE,
      content: message,
    });

  return {
    t,
    messages: messages || [],
    handleSendMessage,
  };
};

export { useMessenger };
