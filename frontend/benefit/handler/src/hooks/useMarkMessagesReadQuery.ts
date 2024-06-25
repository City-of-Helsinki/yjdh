import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import { MessageData } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useMarkMessagesReadQuery = (
  applicationId: string
): UseMutationResult<void, Error, void> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:messenger.list.errors.readMarkerOperation.label'),
      t('common:messenger.list.errors.readMarkerOperation.text')
    );
  };

  return useMutation(
    ['messages', applicationId, 'markRead'],
    async () => {
      const res = axios.post<MessageData[]>(
        `${BackendEndpoint.HANDLER_APPLICATIONS}${applicationId}/${MESSAGE_URLS.MESSAGES}mark_read/`
      );
      return void handleResponse(res);
    },
    {
      onError: () => handleError(),
    }
  );
};

export default useMarkMessagesReadQuery;
