import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MessageData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useMessagesQuery = (
  applicationId: string
): UseQueryResult<MessageData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:messages.list.errors.fetch.label'),
      t('common:messages.list.errors.fetch.text', {
        status,
      })
    );
  };

  return useQuery<MessageData[], Error>(
    ['messagesList'],
    async () => {
      const res = axios.get<MessageData[]>(
        `${BackendEndpoint.HANDLER_APPLICATIONS}/${applicationId}/messages`
      );
      return handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useMessagesQuery;
