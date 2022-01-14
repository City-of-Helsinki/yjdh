import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
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
    ['attachment'],
    (attachment: RemoveAttachmentData) =>
      !attachment?.applicationId
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<RemoveAttachmentData>(
            axios.delete(
              `${BackendEndpoint.APPLICATIONS}${attachment?.applicationId}/attachments/${attachment?.attachmentId}/`
            )
          ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
      },
    }
  );
};

export default useRemoveAttachmentQuery;
