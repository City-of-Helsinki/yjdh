import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { ROUTES_FOR_ANONYMOUS_USERS } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import React from 'react';
import type { AuthContextType } from 'shared/auth/AuthContext';
import AuthContext from 'shared/auth/AuthContext';

const AuthProvider = <P,>({
  children,
}: React.PropsWithChildren<P>): React.ReactElement => {
  const router = useRouter();

  const skipAuthCheck = React.useMemo(
    () => ROUTES_FOR_ANONYMOUS_USERS.includes(router.route),
    [router.route]
  );

  const userQuery = useUserQuery({
    enabled: !skipAuthCheck,
  });

  const authContextProps = React.useMemo(
    (): AuthContextType => ({
      isAuthenticated: userQuery.isSuccess && Boolean(userQuery.data),
      isLoading: userQuery.isLoading,
      isError: userQuery.isError,
    }),
    [
      userQuery.isSuccess,
      userQuery.data,
      userQuery.isLoading,
      userQuery.isError,
    ]
  );

  return (
    <AuthContext.Provider value={authContextProps}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
