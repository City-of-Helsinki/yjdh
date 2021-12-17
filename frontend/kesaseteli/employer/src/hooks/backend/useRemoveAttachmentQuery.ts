import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

type RemoveAttachmentData = {
  summer_voucher: KesaseteliAttachment['summer_voucher'];
  id: KesaseteliAttachment['id'];
};

const useRemoveAttachmentQuery = (): UseMutationResult<
  RemoveAttachmentData,
  unknown,
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
