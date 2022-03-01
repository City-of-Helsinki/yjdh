import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

// check that authentication is still alive in every 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;

const useUserQuery = <T = User>(
  select?: (user: User) => T
): UseQueryResult<T, Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout =
    router.route === '/login' && router.asPath.includes('logout=true'); // router.query doesn't always contain the logout parameter
  const locale = useLocale();
  const { axios, handleResponse } = useBackendAPI();

  const handleError = (error: Error): void => {
    if (logout) {
      void router.push(`${locale}/login?logout=true`);
    } else if (/40[13]/.test(error.message)) {
      void router.push(`${locale}/login`);
    } else {
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      );
    }
  };

  return useQuery(
    `${BackendEndpoint.USER}`,
    () => handleResponse<User>(axios.get(BackendEndpoint.USER)),
    {
      refetchInterval: FIVE_MINUTES,
      enabled: !logout,
      retry: false,
      select,
      onError: (error) => handleError(error),
    }
  );
};
export default useUserQuery;
