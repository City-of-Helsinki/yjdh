import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import { KesaseteliAttachment } from 'shared/types/attachment';

type UploadAttachmentData = {
  summer_voucher: KesaseteliAttachment['summer_voucher'];
  data: FormData;
};

const useUploadAttachmentQuery = (): UseMutationResult<
  KesaseteliAttachment,
  Error,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
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
          ),
    {
      onError: (error) => handleError(error, t, router, locale),
    }
  );
};

export default useUploadAttachmentQuery;
