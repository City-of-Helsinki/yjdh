import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ErrorResponse } from 'benefit/applicant/types/common';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type SecondInstalmentRespondParams = {
  applicationId: string;
};

const useSecondInstalmentRespondMutation = (): UseMutationResult<
  void,
  ErrorResponse,
  SecondInstalmentRespondParams
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, SecondInstalmentRespondParams>({
    mutationFn: ({ applicationId }) =>
      handleResponse<void>(
        axios.post(ApplicantEndpoint.SECOND_INSTALMENT_RESPOND(applicationId))
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['application'] });
    },
  });
};

export default useSecondInstalmentRespondMutation;
