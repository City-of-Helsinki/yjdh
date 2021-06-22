import getBackendUrl from 'kesaseteli/employer/backend-api/get-backend-url';
import { useRouter } from 'next/router';
import React from 'react';
import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';

const useLogin = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    () => router.push(getBackendUrl(backendEndpoint.login)),
    [router]
  );
};

export default useLogin;
