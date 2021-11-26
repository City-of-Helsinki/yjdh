import { BackendEndpoint } from 'benefit/applicant/backend-api/backend-api';
import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useLogoutQuery = (): UseMutationResult<unknown, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(
    'logout',
    () => handleResponse(axios.post(BackendEndpoint.LOGOUT)),
    {
      onSuccess: () => {
        void queryClient.clear();
        void router.push('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
