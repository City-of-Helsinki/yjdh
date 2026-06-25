import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { RemoveAttachmentData } from 'shared/types/attachment';

const useRemoveAttachmentQuery = (): UseMutationResult<
  RemoveAttachmentData,
  ErrorResponse,
  RemoveAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<RemoveAttachmentData, ErrorResponse, RemoveAttachmentData>(
    {
      mutationKey: ['attachment'],
      mutationFn: (attachment: RemoveAttachmentData) =>
        attachment?.applicationId
          ? handleResponse<RemoveAttachmentData>(
              axios.delete(
                `${BackendEndpoint.APPLICATIONS}${attachment?.applicationId}/attachments/${attachment?.attachmentId}/`
              )
            )
          : Promise.reject(new Error('Missing application id')),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['applications'] });
        void queryClient.invalidateQueries({ queryKey: ['application'] });
      },
    }
  );
};

export default useRemoveAttachmentQuery;
