import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { User, UserData } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect } from 'react';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import {
  getLocalStorageItem,
  setLocalStorageItem,
} from 'shared/utils/localstorage.utils';

import { LOCAL_STORAGE_KEYS, ROUTES } from '../constants';

// check that authentication is still alive in every 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;

const UNAUTHORIZER_ROUTES = new Set([
  ROUTES.LOGIN,
  ROUTES.ACCESSIBILITY_STATEMENT,
  ROUTES.COOKIE_SETTINGS,
]);

const useUserQuery = (
  queryKeys?: string | unknown[]
  // eslint-disable-next-line sonarjs/cognitive-complexity
): UseQueryResult<User, Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout =
    router.route === '/login' && router.asPath.includes('logout=true'); // router.query doesn't always contain the logout parameter
  const locale = useLocale();
  const { axios, handleResponse } = useBackendAPI();

  const handleError = useCallback(
    (error: Error): void => {
      if (logout) {
        void router.push(`${locale}/login?logout=true`);
      } else if (/40[13]/.test(error.message)) {
        if (UNAUTHORIZER_ROUTES.has(router.route as ROUTES)) {
          return;
        }
        void router.push(`${locale}/login`);
      } else {
        showErrorToast(
          t('common:error.generic.label'),
          t('common:error.generic.text')
        );
      }
    },
    [logout, router, locale, t]
  );

  const handleSuccess = useCallback(
    (data: User): void => {
      const { id, csrfToken, termsOfServiceApprovalNeeded } = data;
      setLocalStorageItem(LOCAL_STORAGE_KEYS.CSRF_TOKEN, csrfToken);
      axios.defaults.headers['X-CSRFToken'] = csrfToken;
      if (id && termsOfServiceApprovalNeeded)
        setLocalStorageItem(
          LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED,
          'false'
        );
    },
    [axios]
  );

  const params =
    getLocalStorageItem(LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED) ===
    'true'
      ? {}
      : { terms: 1 };

  const query = useQuery({
    queryKey: Array.isArray(queryKeys)
      ? queryKeys
      : [queryKeys ?? `${BackendEndpoint.USER}`],
    queryFn: () =>
      handleResponse<UserData>(axios.get(BackendEndpoint.USER_ME, { params })),
    refetchInterval: FIVE_MINUTES,
    enabled: !logout,
    retry: false,
    select: (data) => camelcaseKeys(data, { deep: true }),
  });

  useEffect(() => {
    if (query.data) {
      handleSuccess(query.data);
    } else if (query.isError) {
      handleError(query.error);
    }
  }, [handleError, handleSuccess, query]);

  return query;
};

export default useUserQuery;
