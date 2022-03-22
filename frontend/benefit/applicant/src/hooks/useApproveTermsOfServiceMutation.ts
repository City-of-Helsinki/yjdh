import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import { ROUTES } from '../constants';
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

  const router = useRouter();

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
        if (data.id) void router.push(ROUTES.HOME);
      },
    }
  );
};

export default useApproveTermsOfServiceMutation;
