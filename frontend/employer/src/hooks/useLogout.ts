import backendEndpoint from 'employer/backend-api/backend-endpoints';
import getBackendUrl from 'employer/backend-api/backend-url';
import { useRouter } from 'next/router';
import React from 'react';

const logoutUrl = `${getBackendUrl()}${backendEndpoint.LOGOUT}`;

const useLogout = (): ((event: React.SyntheticEvent) => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    (event: React.SyntheticEvent<unknown>) => {
      event.preventDefault();
      return router.push(logoutUrl);
    },
    [router]
  );
};

export default useLogout;
