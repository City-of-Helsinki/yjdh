import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

import invalidateYouthAttachmentQueries from './invalidateYouthAttachmentQueries';

type DeleteYouthAttachmentData = {
  applicationId: string;
  attachmentId: string;
};

/**
 * Provides a mutation to delete an existing attachment from a youth application.
 *
 * Upon success, it invalidates both the youth application state and its timeline
 * queries so that the UI correctly reflects the removed attachment and decreased
 * attachment count.
 */
const useDeleteYouthAttachmentMutation = (): UseMutationResult<
  void,
  unknown,
  DeleteYouthAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BackendEndpoint.YOUTH_APPLICATIONS, 'delete_attachment'],
    mutationFn: ({ applicationId, attachmentId }: DeleteYouthAttachmentData) =>
      handleResponse<void>(
        axios.delete(
          `${BackendEndpoint.YOUTH_APPLICATIONS}${applicationId}/attachments/${attachmentId}/`
        )
      ),
    onSuccess: async (_data, { applicationId }) => {
      await invalidateYouthAttachmentQueries(queryClient, applicationId);
    },
    onError: useErrorHandler(),
  });
};

export default useDeleteYouthAttachmentMutation;
