import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';

const REDIRECT_FIELD_NAME = 'next';

const useLogin = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(() => {
    const nextUrl = encodeURIComponent(window.location.origin);
    const loginUrl = `${getBackendUrl(BackendEndpoint.OAUTH_LOGIN)}?${REDIRECT_FIELD_NAME}=${nextUrl}`;
    return router.push(loginUrl);
  }, [router]);
};

export default useLogin;
