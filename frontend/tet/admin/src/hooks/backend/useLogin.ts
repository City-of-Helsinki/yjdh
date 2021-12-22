import { BackendEndpoint, getBackendUrl } from 'tet-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

const useLogin = (): (() => Promise<boolean>) => {
  const router = useRouter();
  const locale = useLocale();
  return React.useCallback(
    () => router.push(`${getBackendUrl(BackendEndpoint.LOGIN)}?lang=${locale}`),
    [router, locale],
  );
};

export default useLogin;
