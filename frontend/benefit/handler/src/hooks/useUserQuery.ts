import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

// check that authentication is still alive in every 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;

const useUserQuery = <T = User>(
  select?: (user: User) => T
): UseQueryResult<T, Error> => {
  const router = useRouter();
  const locale = useLocale();
  // Don't fetch user state if status is logged out
  const logout =
    (router.route === '/login' || router.route === `${locale}/login`) &&
    (router.asPath.includes('logout=true') ||
      router.asPath.includes('userStateError=true'));
  const { axios, handleResponse } = useBackendAPI();

  const handleError = (error: Error): void => {
    if (logout) {
      void router.push(`${locale}/login?logout=true`);
    } else if (/40[13]/.test(error.message)) {
      void router.push(`${locale}/login`);
    } else {
      void router.push(`${locale}/login?userStateError=true`);
    }
  };

  return useQuery(
    `${BackendEndpoint.USER_ME}`,
    () => handleResponse<User>(axios.get(BackendEndpoint.USER_ME)),
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
