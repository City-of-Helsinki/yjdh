import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import {
  BackendEndpoint,
  getBackendUrl,
  getLogoutRedirectUrl,
  REDIRECT_FIELD_NAME,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';

const useLogout = (): ((logoutRedirectPath?: string) => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    async (logoutRedirectPath?: string) => {
      ApplicationPersistenceService.clearAll();
      const logoutUrl = getBackendUrl(BackendEndpoint.LOGOUT);
      const redirectPath =
        logoutRedirectPath || getLogoutRedirectUrl(router.locale);
      return router.push(
        `${logoutUrl}?${REDIRECT_FIELD_NAME}=${encodeURIComponent(
          redirectPath
        )}`
      );
    },
    [router]
  );
};

export default useLogout;
