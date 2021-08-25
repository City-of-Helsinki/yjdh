import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { UploadAttachmentData } from 'benefit/applicant/types/application';
import { ErrorResponse } from 'benefit/applicant/types/common';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useUploadAttachmentQuery = (): UseMutationResult<
  UploadAttachmentData,
  ErrorResponse,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  return useMutation<UploadAttachmentData, ErrorResponse, UploadAttachmentData>(
    ['attachment'],
    (attachment: UploadAttachmentData) =>
      !attachment?.applicationId
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<UploadAttachmentData>(
            axios.post(
              `${BackendEndpoint.APPLICATIONS}${attachment?.applicationId}/attachments/`,
              attachment.data,
              {
                headers: {
                  'Content-type': 'multipart/form-data',
                },
              }
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

export default useUploadAttachmentQuery;
