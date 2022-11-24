import { useRouter } from 'next/router';
import React from 'react';
import { BackendEndpoint, getBackendUrl } from 'tet/admin/backend-api/backend-api';

const useLogout = (): (() => Promise<boolean>) => {
  const router = useRouter();
  return React.useCallback(() => router.push(getBackendUrl(BackendEndpoint.LOGOUT)), [router]);
};

export default useLogout;
