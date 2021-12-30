import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

type UploadAttachmentData = {
  summer_voucher: KesaseteliAttachment['summer_voucher'];
  data: FormData;
};

const useUploadAttachmentQuery = (): UseMutationResult<
  KesaseteliAttachment,
  unknown,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useMutation(
    BackendEndpoint.ATTACHMENTS,
    ({ summer_voucher, data }: UploadAttachmentData) =>
      !summer_voucher
        ? Promise.reject(new Error('Missing summer_voucher id'))
        : handleResponse<KesaseteliAttachment>(
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
