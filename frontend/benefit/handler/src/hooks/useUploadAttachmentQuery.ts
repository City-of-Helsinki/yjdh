import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ErrorResponse } from 'benefit/handler/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { UploadAttachmentData } from 'shared/types/attachment';

const useUploadAttachmentQuery = (): UseMutationResult<
  UploadAttachmentData,
  ErrorResponse,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<UploadAttachmentData, ErrorResponse, UploadAttachmentData>(
    {
      mutationKey: ['attachment'],
      mutationFn: (attachment: UploadAttachmentData) =>
        attachment?.applicationId
          ? handleResponse<UploadAttachmentData>(
              axios.post(
                `${BackendEndpoint.HANDLER_APPLICATIONS}${attachment?.applicationId}/attachments/`,
                attachment.data,
                {
                  headers: {
                    'Content-type': 'multipart/form-data',
                  },
                }
              )
            )
          : Promise.reject(new Error('Missing application id')),
      onSuccess: () => {
        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ['applications'] });
        }, 50);
      },
    }
  );
};

export default useUploadAttachmentQuery;
