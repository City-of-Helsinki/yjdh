import {
  BackendEndpoint,
  getEmployerApplicationQueryKey,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { KesaseteliAttachment } from 'shared/types/attachment';

type UploadAttachmentData = {
  summer_voucher: string;
  applicationId: string;
  data: FormData;
};

const useUploadAttachmentQuery = (): UseMutationResult<
  KesaseteliAttachment,
  unknown,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation(
    BackendEndpoint.ATTACHMENTS,
    ({ summer_voucher, data }: UploadAttachmentData) =>
      handleResponse<KesaseteliAttachment>(
        axios.post(
          `${BackendEndpoint.EMPLOYER_SUMMER_VOUCHERS}${summer_voucher}${BackendEndpoint.ATTACHMENTS}`,
          data,
          { headers: { 'Content-type': 'multipart/form-data' } }
        )
      ),
    {
      onSuccess: async (_data, { applicationId }) => {
        await queryClient.invalidateQueries(
          getEmployerApplicationQueryKey(applicationId)
        );
      },
    }
  );
};

export default useUploadAttachmentQuery;
