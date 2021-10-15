import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { useRouter } from 'next/router';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';

const useLogoutQuery = (): UseMutationResult => {
  const { axios, handleResponse } = useBackendAPI();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(
    'logout',
    () => handleResponse<unknown>(axios.post(BackendEndpoint.LOGOUT)),
    {
      onSuccess: () => {
        void queryClient.removeQueries();
        clearLocalStorage('application');
        void router.push('/login?logout=true');
      },
    }
  );
};

export default useLogoutQuery;
