import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

import invalidateAttachmentQueries from './invalidateAttachmentQueries';

type UploadAttachmentData = {
  summer_voucher: string;
  applicationId: string;
  data: FormData;
};

const useUploadAttachmentQuery = (): UseMutationResult<
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
      await invalidateAttachmentQueries(queryClient, applicationId);
    },
  });
};

export default useUploadAttachmentQuery;
