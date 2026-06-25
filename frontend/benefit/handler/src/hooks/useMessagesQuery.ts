import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import { Message, MessageData } from 'benefit-shared/types/application';
import { mapMessages } from 'benefit-shared/utils/common';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useMessagesQuery = (
  applicationId: string,
  messageType: MESSAGE_URLS
): UseQueryResult<Message[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const query = useQuery({
    queryKey: ['messages', applicationId, messageType],
    queryFn: async () => {
      const res = axios.get<MessageData[]>(
        `${BackendEndpoint.HANDLER_APPLICATIONS}${applicationId}/${messageType}`
      );
      return handleResponse(res);
    },
    select: (data: MessageData[]) => mapMessages(data),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (query.isError) {
      showErrorToast(
        t('common:messenger.list.errors.fetch.label'),
        t('common:messenger.list.errors.fetch.text')
      );
    }
  }, [query, t]);

  return query;
};

export default useMessagesQuery;
