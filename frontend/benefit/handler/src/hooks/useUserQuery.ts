import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';
import { setLocalStorageItem } from 'shared/utils/localstorage.utils';

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

  const handleError = useCallback(
    (error: AxiosError): void => {
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
    },
    [logout, locale, router]
  );

  const checkForStaffStatus = useCallback(
    (user: User): void => {
      if (user && !user.is_staff) {
        void noPermissionLogout();
      }
    },
    [noPermissionLogout]
  );

  const handleSuccess = useCallback(
    (user: User) => {
      checkForStaffStatus(user);
      if (user.csrf_token) {
        setLocalStorageItem(LOCAL_STORAGE_KEYS.CSRF_TOKEN, user.csrf_token);
        axios.defaults.headers['X-CSRFToken'] = user.csrf_token;
      }
    },
    [axios, checkForStaffStatus]
  );

  const query = useQuery<T | User, AxiosError>({
    queryKey: [BackendEndpoint.USER_ME],
    queryFn: () => handleResponse<User>(axios.get(BackendEndpoint.USER_ME)),
    refetchInterval: FIVE_MINUTES,
    enabled: !logout,
    retry: false,
    select,
  });

  useEffect(() => {
    if (query.data) {
      handleSuccess(query.data);
    } else if (query.isError) {
      handleError(query.error);
    }
  }, [query, handleSuccess, handleError]);

  return query;
};
export default useUserQuery;
