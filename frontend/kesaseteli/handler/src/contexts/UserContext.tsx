import useUserQuery from 'kesaseteli/handler/hooks/backend/useUserQuery';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { ROUTES_FOR_ANONYMOUS_USERS } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import React from 'react';
import { useQueryClient } from 'react-query';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import theme from 'shared/styles/theme';
import User from 'shared/types/user';
import { ThemeProvider } from 'styled-components';

/**
 * Context type representing the user's authentication and loading state.
 */
export type UserContextType = {
  /** The logged-in user object, or undefined if not logged in or loading. */
  user: User | undefined;
  /** Flag indicating if the user query is loading. */
  isLoading: boolean;
  /** Flag indicating if the user query is fetching (e.g. background refetch). */
  isFetching: boolean;
  /** Flag indicating if the user is authenticated. */
  isAuthenticated: boolean;
  /** Function to explicitly clear the user cache. */
  clearUser: () => void;
};

/**
 * React context for user state and authentication information.
 */
export const UserContext = React.createContext<UserContextType | undefined>(
  undefined
);

/**
 * Hook to retrieve user context state.
 *
 * @throws {Error} If the hook is used outside of a {@link UserProvider}.
 * @returns {UserContextType} The current user context state.
 */
export const useUser = (): UserContextType => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Provider component that fetches user information and manages authentication state context.
 *
 * For non-anonymous routes, it queries the current user. If loading or query errors out,
 * it displays a page-loading spinner instead of the application content.
 *
 * @param props - Component props containing children.
 * @returns The provider component or a loading spinner.
 */
export const UserProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const skipAuthCheck = React.useMemo(
    () => ROUTES_FOR_ANONYMOUS_USERS.includes(router.route),
    [router.route]
  );

  const userQuery = useUserQuery({
    enabled: !skipAuthCheck,
  });

  const { data: user, isLoading, isFetching, isSuccess, isError } = userQuery;

  const clearUser = React.useCallback(() => {
    queryClient.removeQueries(BackendEndpoint.USER);
  }, [queryClient]);

  const contextValue = React.useMemo(
    (): UserContextType => ({
      user,
      isLoading,
      isFetching,
      isAuthenticated: isSuccess && Boolean(user),
      clearUser,
    }),
    [user, isLoading, isFetching, isSuccess, clearUser]
  );

  if (!skipAuthCheck && (isLoading || (isError && !user))) {
    return (
      <ThemeProvider theme={theme}>
        <PageLoadingSpinner />
      </ThemeProvider>
    );
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
