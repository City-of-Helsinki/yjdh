import { ErrorResponse } from 'benefit/applicant/types/common';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type ChangeEmployerAssuranceParams = {
  applicationId: string;
  employerAssurance: boolean;
};

const useChangeEmployerAssuranceMutation = (): UseMutationResult<
  void,
  ErrorResponse,
  ChangeEmployerAssuranceParams
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, ChangeEmployerAssuranceParams>(
    ({ applicationId, employerAssurance }) =>
      handleResponse<void>(
        axios.patch(
          ApplicantEndpoint.CHANGE_EMPLOYER_ASSURANCE(applicationId),
          {
            employerAssurance,
          }
        )
      ),
    {
      onSuccess: (_data, { applicationId }) => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries(['applications', applicationId]);
        void queryClient.invalidateQueries('application');
      },
    }
  );
};

export default useChangeEmployerAssuranceMutation;
