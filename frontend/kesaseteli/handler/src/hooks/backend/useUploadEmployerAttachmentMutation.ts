import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

import invalidateEmployerAttachmentQueries from './invalidateEmployerAttachmentQueries';

type UploadAttachmentData = {
  summer_voucher: string;
  applicationId: string;
  data: FormData;
};

/**
 * Provides a mutation to upload a new attachment to an employer application.
 *
 * Upon success, it invalidates both the employer application state and its timeline
 * queries so that the UI correctly reflects the newly added attachment.
 */
const useUploadEmployerAttachmentMutation = (): UseMutationResult<
  KesaseteliAttachment,
  unknown,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [BackendEndpoint.ATTACHMENTS],
    mutationFn: ({ summer_voucher, data }: UploadAttachmentData) =>
      handleResponse<KesaseteliAttachment>(
        axios.post(
          `${BackendEndpoint.EMPLOYER_SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}`,
          data,
          { headers: { 'Content-type': 'multipart/form-data' } }
        )
      ),
    onSuccess: async (_data, { applicationId }) => {
      await invalidateEmployerAttachmentQueries(queryClient, applicationId);
    },
  });
};

export default useUploadEmployerAttachmentMutation;
