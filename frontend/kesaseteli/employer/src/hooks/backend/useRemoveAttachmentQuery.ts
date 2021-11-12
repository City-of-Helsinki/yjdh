import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
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
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  return useMutation(
    BackendEndpoint.ATTACHMENTS,
    ({ id, summer_voucher }: RemoveAttachmentData) =>
      !summer_voucher || !id
        ? Promise.reject(new Error('Missing summer_voucher or attachment id'))
        : handleResponse<RemoveAttachmentData>(
            axios.delete(
              `${BackendEndpoint.SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}${id}/`
            )
          ),
    {
      onError: (error) => handleError(error, t, router, locale),
    }
  );
};

export default useRemoveAttachmentQuery;
