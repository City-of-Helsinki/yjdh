import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { MessageData } from 'benefit-shared/types/application';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ErrorData } from '../types/common';

const useCreateMessageQuery = (
  applicationId: string
): UseMutationResult<MessageData, AxiosError<ErrorData>, MessageData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<MessageData, AxiosError<ErrorData>, MessageData>(
    'createMessage',
    (message: MessageData) =>
      handleResponse<MessageData>(
        axios.post(
          `${BackendEndpoint.HANDLER_APPLICATIONS}/${applicationId}/messages`,
          message
        )
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('messages');
      },
    }
  );
};

export default useCreateMessageQuery;
