import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import { Message, MessageData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { mapMessages } from '../utils/common';

const useMessagesQuery = (
  applicationId: string,
  messageType: MESSAGE_URLS
): UseQueryResult<Message[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:messenger.list.errors.fetch.label'),
      t('common:messenger.list.errors.fetch.text')
    );
  };

  return useQuery(
    ['messages', applicationId, messageType],
    async () => {
      const res = axios.get<MessageData[]>(
        `${BackendEndpoint.HANDLER_APPLICATIONS}${applicationId}/${messageType}`
      );
      return handleResponse(res);
    },
    {
      select: (data: MessageData[]) => mapMessages(data),
      onError: () => handleError(),
    }
  );
};

export default useMessagesQuery;
