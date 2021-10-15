import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useMutation, UseMutationResult } from 'react-query';
import Attachment from 'shared/types/attachment';

type UploadAttachmentData = {
  summer_voucher: Attachment['summer_voucher'];
  data: FormData;
};

const useUploadAttachmentQuery = (): UseMutationResult<
  Attachment,
  Error,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useMutation<Attachment, Error, UploadAttachmentData>(
    ['attachment'],
    ({ summer_voucher, data }: UploadAttachmentData) =>
      !summer_voucher
        ? Promise.reject(new Error('Missing summer_voucher id'))
        : handleResponse<Attachment>(
            axios.post(
              `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}`,
              data,
              {
                headers: {
                  'Content-type': 'multipart/form-data',
                },
              }
            )
          )
  );
};

export default useUploadAttachmentQuery;
