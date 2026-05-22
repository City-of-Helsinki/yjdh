import { ErrorResponse } from 'benefit/applicant/types/common';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import {
  BenefitAttachment,
  UploadAttachmentData,
} from 'shared/types/attachment';

const useUploadAttachmentQuery = (): UseMutationResult<
  BenefitAttachment,
  ErrorResponse,
  UploadAttachmentData
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation<BenefitAttachment, ErrorResponse, UploadAttachmentData>(
    ['attachment'],
    (attachment: UploadAttachmentData) =>
      !attachment?.applicationId
        ? Promise.reject(new Error('Missing application id'))
        : handleResponse<BenefitAttachment>(
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
        // Only invalidate the applications list, NOT the individual application being edited
        void queryClient.invalidateQueries('applicationsList');
      },
    }
  );
};

export default useUploadAttachmentQuery;
