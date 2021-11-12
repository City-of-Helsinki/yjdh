import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useLogoutQuery = (): UseMutationResult<unknown, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(
    'logout',
    () => handleResponse(axios.post(BackendEndpoint.LOGOUT)),
    {
      onSuccess: () => {
        void queryClient.removeQueries('application');
        void queryClient.removeQueries('applications');
        void router.push('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
