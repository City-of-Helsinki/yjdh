import {
  BackendEndpoint,
  getBackendUrl,
  REDIRECT_FIELD_NAME,
} from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

const useLogin = (): (() => Promise<boolean>) => {
  const router = useRouter();
  const locale = useLocale();
  return React.useCallback(() => {
    const nextUrl = encodeURIComponent(window.location.origin);
    const loginUrl = `${getBackendUrl(
      BackendEndpoint.ADFS_LOGIN
    )}?lang=${locale}&${REDIRECT_FIELD_NAME}=${nextUrl}`;
    return router.push(loginUrl);
  }, [locale, router]);
};

export default useLogin;
