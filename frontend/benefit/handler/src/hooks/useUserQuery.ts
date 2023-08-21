import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

import { LOCAL_STORAGE_KEYS, ROUTES } from '../constants';
import useLogout from './useLogout';

// check that authentication is still alive in every 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;

const useUserQuery = <T extends User>(
  select?: (user: User) => T
): UseQueryResult<T | User, AxiosError> => {
  const router = useRouter();
  const locale = useLocale();
  const noPermissionLogout = useLogout();

  // Don't fetch user state if status is logged out
  const logout =
    (router.route === ROUTES.LOGIN ||
      router.route === `${locale}${ROUTES.LOGIN}`) &&
    (router.asPath.includes('logout=true') ||
      router.asPath.includes('userStateError=true'));
  const { axios, handleResponse } = useBackendAPI();

  const handleError = (error: AxiosError): void => {
    if (logout) {
      void router.push(`${locale}${ROUTES.LOGIN}?logout=true`);
    } else if (/40[13]/.test(error.message)) {
      void router.push(`${locale}${ROUTES.LOGIN}`);
    } else if (
      !process.env.NEXT_PUBLIC_MOCK_FLAG ||
      process.env.NEXT_PUBLIC_MOCK_FLAG === '0'
    ) {
      void router.push(`${locale}${ROUTES.LOGIN}?userStateError=true`);
    }
  };

  const checkForStaffStatus = (user: User): void => {
    if (user && !user.is_staff) {
      void noPermissionLogout();
    }
  };

  const onSuccessHandler = (user: User): void => {
    checkForStaffStatus(user);
    // eslint-disable-next-line scanjs-rules/identifier_localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.CSRF_TOKEN, user.csrf_token);
  };

  return useQuery(
    `${BackendEndpoint.USER_ME}`,
    () => handleResponse<User>(axios.get(BackendEndpoint.USER_ME)),
    {
      refetchInterval: FIVE_MINUTES,
      enabled: !logout,
      retry: false,
      select,
      onSuccess: onSuccessHandler,
      onError: (error) => handleError(error),
    }
  );
};
export default useUserQuery;
