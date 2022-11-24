import { useRouter } from 'next/router';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import { BackendEndpoint, getBackendUrl } from 'tet/admin/backend-api/backend-api';

const loginEndPoints = {
  adfs: BackendEndpoint.LOGIN_ADFS,
  oidc: BackendEndpoint.LOGIN_OIDC,
};

const useLogin = (type: keyof typeof loginEndPoints): (() => Promise<boolean>) => {
  const router = useRouter();
  const locale = useLocale();
  return React.useCallback(
    () => router.push(`${getBackendUrl(loginEndPoints[type])}?lang=${locale}`),
    [router, type, locale],
  );
};

export default useLogin;
