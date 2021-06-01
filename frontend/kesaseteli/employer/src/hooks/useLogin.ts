import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import getBackendUrl from 'kesaseteli/employer/backend-api/backend-url';
import { useRouter } from 'next/router';
import React from 'react';

const loginUrl = `${getBackendUrl()}${backendEndpoint.LOGIN}`;

const useLogin = (): ((event: React.SyntheticEvent) => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    (event: React.SyntheticEvent<unknown>) => {
      event.preventDefault();
      return router.push(loginUrl);
    },
    [router]
  );
};

export default useLogin;
