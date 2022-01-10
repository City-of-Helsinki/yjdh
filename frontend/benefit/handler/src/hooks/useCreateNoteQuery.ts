import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MessageData } from 'benefit-shared/types/application';
import { useTranslation } from 'react-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useCreateNoteQuery = (
  applicationId: string
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

  return useMutation<MessageData, AxiosError<ErrorData>, MessageData>(
    ['createMessage', applicationId],
    async (message: MessageData) =>
      handleResponse<MessageData>(
        axios.post(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${applicationId}/notes/`,
          message
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('notes');
      },
      onError: () => handleError(),
    }
  );
};

export default useCreateNoteQuery;
