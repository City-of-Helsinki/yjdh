
import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { UploadAttachmentData } from 'shared/types/employer-attachment';

const useUploadAttachmentQuery = (applicationId: string): UseMutationResult<
  UploadAttachmentData,
  unknown,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<UploadAttachmentData, ErrorResponse, UploadAttachmentData>(
    ['attachment'],
    (attachment: UploadAttachmentData) =>
      !attachment?.summerVoucherId
        ? Promise.reject(new Error('Missing summer_voucher id'))
        : handleResponse<UploadAttachmentData>(
            axios.post(
              `${BackendEndpoint.SUMMER_VOUCHERS}${attachment?.summerVoucherId}${BackendEndpoint.ATTACHMENTS}`,
              attachment.data,
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
