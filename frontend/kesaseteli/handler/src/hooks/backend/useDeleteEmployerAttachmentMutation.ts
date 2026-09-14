import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateEmployerAttachmentQueries from './invalidateEmployerAttachmentQueries';

type DeleteAttachmentVariables = {
  voucherId: string;
  applicationId: string;
  attachmentId: string;
};

/**
 * Provides a mutation to delete an existing attachment from an employer application.
 *
 * Upon success, it invalidates both the employer application state and its timeline
 * queries so that the UI correctly reflects the removed attachment and decreased
 * attachment count.
 */
const useDeleteEmployerAttachmentMutation = (): UseMutationResult<
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
      await invalidateEmployerAttachmentQueries(queryClient, applicationId);
    },
    onError: useErrorHandler(),
  });
};

export default useDeleteEmployerAttachmentMutation;
