import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useLogoutQuery = (): UseMutationResult<unknown, Error, void> => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, void>(
    'logout',
    () => handleResponse<unknown>(axios.post(BackendEndpoint.LOGOUT)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        void router.push('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
