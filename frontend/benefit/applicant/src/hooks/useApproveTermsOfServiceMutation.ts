import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import {
  ApproveTermsOfServiceRequestData,
  ApproveTermsOfServiceResponseData,
} from '../types/application';

const useApproveTermsOfServiceMutation = (): UseMutationResult<
  ApproveTermsOfServiceResponseData,
  unknown,
  ApproveTermsOfServiceRequestData
> => {
  const { axios, handleResponse } = useBackendAPI();

  const queryClient = useQueryClient();

  return useMutation<
    ApproveTermsOfServiceResponseData,
    unknown,
    ApproveTermsOfServiceRequestData
  >(
    'approveTermsOfService',
    (requestBody: ApproveTermsOfServiceRequestData) =>
      handleResponse<ApproveTermsOfServiceResponseData>(
        axios.post(BackendEndpoint.APPROVE_TERMS_OF_SERVICE, requestBody)
      ),
    {
      onSuccess: (data) => {
        if (data.id)
          void queryClient.invalidateQueries('checkTermsOfServiceApproval');
      },
    }
  );
};

export default useApproveTermsOfServiceMutation;
