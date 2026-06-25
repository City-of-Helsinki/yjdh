import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import {
  ApplicantConsents,
  ApproveTermsOfServiceResponseData,
  User,
} from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApproveTermsOfServiceMutation = (): UseMutationResult<
  ApproveTermsOfServiceResponseData,
  unknown,
  User
> => {
  const { axios, handleResponse } = useBackendAPI();

  return useMutation<ApproveTermsOfServiceResponseData, unknown, User>({
    mutationKey: ['approveTermsOfService'],
    mutationFn: (user: User) =>
      handleResponse<ApproveTermsOfServiceResponseData>(
        axios.post(BackendEndpoint.APPROVE_TERMS_OF_SERVICE, {
          terms: user.termsOfServiceInEffect.id,
          selected_applicant_consents:
            user.termsOfServiceInEffect.applicantConsents.map(
              (item: ApplicantConsents) => item.id
            ),
        })
      ),
  });
};

export default useApproveTermsOfServiceMutation;
