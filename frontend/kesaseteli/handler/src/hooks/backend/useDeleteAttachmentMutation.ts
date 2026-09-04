import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateAttachmentQueries from './invalidateAttachmentQueries';

type DeleteAttachmentVariables = {
  voucherId: string;
  applicationId: string;
  attachmentId: string;
};

const useDeleteAttachmentMutation = (): UseMutationResult<
  void,
  unknown,
  DeleteAttachmentVariables
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voucherId, attachmentId }: DeleteAttachmentVariables) =>
      handleResponse<void>(
        axios.delete(
          `${BackendEndpoint.EMPLOYER_SUMMER_VOUCHERS}${voucherId}${BackendEndpoint.ATTACHMENTS}${attachmentId}/`
        )
      ),
    onSuccess: async (_data, { applicationId }) => {
      await invalidateAttachmentQueries(queryClient, applicationId);
    },
    onError: useErrorHandler(),
  });
};

export default useDeleteAttachmentMutation;
