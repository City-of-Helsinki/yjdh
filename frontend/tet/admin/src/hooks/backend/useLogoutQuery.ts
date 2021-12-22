import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'tet-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';

const useLogoutQuery = (): UseMutationResult<unknown, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  return useMutation('logout', () => handleResponse(axios.post(BackendEndpoint.LOGOUT)), {
    onSuccess: () => {
      void queryClient.removeQueries();
      clearLocalStorage('application');
      void router.push('/login?logout=true');
    },
    onError: (error) => handleError(error, t, router, locale),
  });
};

export default useLogoutQuery;
