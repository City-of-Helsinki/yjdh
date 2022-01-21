import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MESSAGE_URLS } from 'benefit-shared/constants';
import { MessageData } from 'benefit-shared/types/application';
import { useTranslation } from 'react-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useCreateMessageQuery = (
  applicationId: string,
  messageType: MESSAGE_URLS
): UseMutationResult<MessageData, AxiosError<ErrorData>, MessageData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleError = (): void => {
    showErrorToast(
      t('common:messenger.list.errors.create.label'),
      t('common:messenger.list.errors.create.text')
    );
  };

  return useMutation(
    ['createMessage', applicationId, messageType],
    (message: MessageData) =>
      handleResponse<MessageData>(
        axios.post(
          `${BackendEndpoint.APPLICATIONS}${applicationId}/${messageType}/`,
          message
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('messages');
      },
      onError: () => handleError(),
    }
  );
};

export default useCreateMessageQuery;
