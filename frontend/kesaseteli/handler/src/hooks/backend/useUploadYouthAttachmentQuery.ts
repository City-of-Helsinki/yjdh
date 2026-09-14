import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import type { KesaseteliAttachment } from 'shared/types/attachment';

import invalidateYouthAttachmentQueries from './invalidateYouthAttachmentQueries';

type UploadYouthAttachmentData = {
  applicationId: string;
  data: FormData;
};

/**
 * Provides a mutation to upload a new attachment to a youth application.
 *
 * Note: The backend view (`YouthApplicationViewSet.post_attachment`) currently
 * restricts uploads to applications that are in the `ADDITIONAL_INFORMATION_REQUESTED`
 * status, otherwise it will reject the request.
 *
 * Upon success, it invalidates both the youth application state and its timeline
 * queries so that the UI correctly reflects the newly added attachment.
 */
const useUploadYouthAttachmentQuery = (): UseMutationResult<
  KesaseteliAttachment,
  unknown,
  UploadYouthAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BackendEndpoint.YOUTH_APPLICATIONS, 'post_attachment'],
    mutationFn: ({ applicationId, data }: UploadYouthAttachmentData) =>
      handleResponse<KesaseteliAttachment>(
        axios.post(
          `${BackendEndpoint.YOUTH_APPLICATIONS}${applicationId}/post_attachment/`,
          data,
          { headers: { 'Content-type': 'multipart/form-data' } }
        )
      ),
    onSuccess: async (_data, { applicationId }) => {
      await invalidateYouthAttachmentQueries(queryClient, applicationId);
    },
  });
};

export default useUploadYouthAttachmentQuery;
