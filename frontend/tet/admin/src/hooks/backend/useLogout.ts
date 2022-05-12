import { useRouter } from 'next/router';
import React from 'react';

import { BackendEndpoint, getBackendUrl } from 'tet/admin/backend-api/backend-api';

const logoutEndPoints = {
  adfs: BackendEndpoint.LOGOUT_ADFS,
  oidc: BackendEndpoint.LOGOUT_OIDC,
};

const useLogout = (type: keyof typeof logoutEndPoints): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(() => router.push(getBackendUrl(logoutEndPoints[type])), [router]);
};

export default useLogout;
