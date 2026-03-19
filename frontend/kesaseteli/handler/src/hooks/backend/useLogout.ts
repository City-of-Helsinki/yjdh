import {
  BackendEndpoint,
  getBackendUrl,
  REDIRECT_FIELD_NAME,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';

const useLogout = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(async () => {
    const nextUrl = encodeURIComponent(window.location.origin);
    const logoutUrl = `${getBackendUrl(
      BackendEndpoint.ADFS_LOGOUT
    )}?${REDIRECT_FIELD_NAME}=${nextUrl}`;
    return router.push(logoutUrl);
  }, [router]);
};

export default useLogout;
