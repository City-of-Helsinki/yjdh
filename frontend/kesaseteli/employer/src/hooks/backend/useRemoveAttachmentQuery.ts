import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { RemoveAttachmentData } from 'shared/types/employer-attachment';

const useRemoveAttachmentQuery = (applicationId: string): UseMutationResult<
  RemoveAttachmentData,
  unknown,
  RemoveAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<RemoveAttachmentData, ErrorResponse, RemoveAttachmentData>(
    ['attachment'],
    (attachment: RemoveAttachmentData) =>
      !attachment?.summerVoucherId || !attachment?.attachmentId
        ? Promise.reject(new Error('Missing summer voucher id or attachment id'))
        : handleResponse<RemoveAttachmentData>(
            axios.delete(
              `${BackendEndpoint.SUMMER_VOUCHERS}${attachment?.summerVoucherId}${BackendEndpoint.ATTACHMENTS}${attachment?.attachmentId}/`
            )
          ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['applications', applicationId]);
      },
    }
  );
};

export default useRemoveAttachmentQuery;
