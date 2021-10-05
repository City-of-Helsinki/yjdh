import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import Attachment from 'shared/types/attachment';

type UploadAttachmentData = {
  summer_voucher: Attachment['summer_voucher'];
  data: FormData;
};

const useUploadAttachmentQuery = (
  applicationId?: string
): UseMutationResult<UploadAttachmentData, unknown, UploadAttachmentData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<UploadAttachmentData, ErrorResponse, UploadAttachmentData>(
    ['attachment'],
    ({ summer_voucher, data }: UploadAttachmentData) =>
      !applicationId
        ? Promise.reject(new Error('Missing applicationId'))
        : handleResponse<UploadAttachmentData>(
            axios.post(
              `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}`,
              data,
              {
                headers: {
                  'Content-type': 'multipart/form-data',
                },
              }
            )
          ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['applications', applicationId]);
      },
    }
  );
};

export default useUploadAttachmentQuery;
