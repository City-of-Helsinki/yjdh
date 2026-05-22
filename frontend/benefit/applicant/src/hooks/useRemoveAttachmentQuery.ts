import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
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
      onSuccess: (data, variables) => {
        // Update the cache directly instead of invalidating
        queryClient.setQueryData<ApplicationData | undefined>(
          ['applications', variables.applicationId],
          (oldData) => {
            if (!oldData) {
              console.warn(
                'No cached data found for application:',
                variables.applicationId
              );
              return oldData;
            }

            const attachments = oldData.attachments || [];
            const attachmentExists = attachments.some(
              (att) => att.id === variables.attachmentId
            );

            if (!attachmentExists) {
              console.warn(
                'Attachment not found in cache:',
                variables.attachmentId
              );
              return oldData;
            }

            return {
              ...oldData,
              attachments: attachments.filter(
                (att) => att.id !== variables.attachmentId
              ),
            };
          }
        );

        // Also invalidate list queries
        void queryClient.invalidateQueries('applicationsList');
      },
    }
  );
};

export default useRemoveAttachmentQuery;
