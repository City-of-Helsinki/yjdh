import getBackendUrl from 'kesaseteli/employer/backend-api/get-backend-url';
import { useRouter } from 'next/router';
import React from 'react';

const useLogin = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(
    () => router.push(getBackendUrl('/oidc/authenticate/')),
    [router]
  );
};

export default useLogin;
