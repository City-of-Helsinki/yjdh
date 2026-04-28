import { useRouter } from 'next/router';
import React from 'react';
import {
  BackendEndpoint,
  getBackendUrl,
  getLogoutRedirectUrl,
  REDIRECT_FIELD_NAME,
} from 'kesaseteli-shared/backend-api/backend-api';

const useLogout = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(async () => {
    const logoutUrl = `${getBackendUrl(
      BackendEndpoint.ADFS_LOGOUT
    )}?${REDIRECT_FIELD_NAME}=${encodeURIComponent(
      getLogoutRedirectUrl(router.locale)
    )}`;
    return router.push(logoutUrl);
  }, [router]);
};

export default useLogout;
