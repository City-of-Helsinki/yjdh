import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit/applicant/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';

//    () => router.push(getBackendUrl(BackendEndpoint.LOGOUT)),

const useLogout = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    () => router.push(getBackendUrl(BackendEndpoint.LOGOUT)),
    [router]
  );
};

export default useLogout;
