import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useMarkMessagesReadMutation = (
  applicationId: string
): UseMutationResult<void, unknown, void> => {
  const { axios, handleResponse } = useBackendAPI();
  const errorHandler = useErrorHandler();

  return useMutation({
    mutationFn: () =>
      handleResponse<void>(
        axios.post(`${BackendEndpoint.HANDLER_NOTES}${applicationId}/mark-read/`)
      ),
    onSuccess: () => {
      console.log('mark messages read');
    },
    onError: errorHandler,
  });
};

export default useMarkMessagesReadMutation;
