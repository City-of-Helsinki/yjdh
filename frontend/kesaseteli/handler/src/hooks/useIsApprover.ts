import useCurrentUserQuery from 'kesaseteli/handler/hooks/backend/useCurrentUserQuery';
import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES_FOR_ANONYMOUS_USERS } from 'kesaseteli-shared/constants/routes';
import isRealIntegrationsEnabled from 'kesaseteli-shared/flags/is-real-integrations-enabled';
import { useRouter } from 'next/router';
import React from 'react';

type UseIsApproverResult = {
  isApprover: boolean;
  isLoading: boolean;
};

/**
 * Hook to determine whether the current user has the approver role.
 *
 * Automatically resolves authentication state from `useUserQuery`.
 * In mock mode (real integrations disabled), any authenticated user
 * is automatically treated as an approver for testing purposes.
 * Otherwise, the approver role is determined by the `currentUserQuery` response.
 *
 * @returns Object containing isApprover and isLoading flags.
 */
const useIsApprover = (): UseIsApproverResult => {
  const router = useRouter();

  const skipAuthCheck = React.useMemo(
    () => ROUTES_FOR_ANONYMOUS_USERS.includes(router?.route ?? ''),
    [router?.route]
  );

  const { data: user, isSuccess } = useUserQuery({
    enabled: !skipAuthCheck,
  });

  const isAuthenticated = isSuccess && Boolean(user);

  const currentUserQuery = useCurrentUserQuery({
    enabled: isAuthenticated,
  });

  return React.useMemo(() => {
    let isApprover = false;
    let isLoading = false;

    if (!isAuthenticated) {
      isApprover = false;
    } else if (!isRealIntegrationsEnabled()) {
      isApprover = true;
    } else {
      isApprover = currentUserQuery.data?.is_approver ?? false;
      isLoading = currentUserQuery.isLoading;
    }

    return {
      isApprover,
      isLoading,
    };
  }, [
    isAuthenticated,
    currentUserQuery.data?.is_approver,
    currentUserQuery.isLoading,
  ]);
};

export default useIsApprover;
