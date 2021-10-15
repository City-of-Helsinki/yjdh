import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult } from 'react-query';
import Attachment from 'shared/types/attachment';

type RemoveAttachmentData = {
  summer_voucher: Attachment['summer_voucher'];
  id: Attachment['id'];
};

const useRemoveAttachmentQuery = (): UseMutationResult<
  RemoveAttachmentData,
  Error,
  RemoveAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useMutation(
    BackendEndpoint.ATTACHMENTS,
    ({ id, summer_voucher }: RemoveAttachmentData) =>
      !summer_voucher || !id
        ? Promise.reject(new Error('Missing summer_voucher or attachment id'))
        : handleResponse<RemoveAttachmentData>(
            axios.delete(
              `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}${id}/`
            )
          )
  );
};

export default useRemoveAttachmentQuery;
