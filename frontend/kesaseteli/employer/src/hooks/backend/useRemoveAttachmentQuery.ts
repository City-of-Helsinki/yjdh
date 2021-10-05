import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import Attachment from 'shared/types/attachment';

type RemoveAttachmentData = {
  summer_voucher: Attachment['summer_voucher'];
  id: Attachment['id'];
};

const useRemoveAttachmentQuery = (
  applicationId?: string
): UseMutationResult<RemoveAttachmentData, Error, RemoveAttachmentData> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<RemoveAttachmentData, Error, RemoveAttachmentData>(
    ['attachment'],
    ({ id, summer_voucher }: RemoveAttachmentData) =>
      !applicationId
        ? Promise.reject(new Error('Missing applicationId'))
        : handleResponse<RemoveAttachmentData>(
            axios.delete(
              `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}${id}/`
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
