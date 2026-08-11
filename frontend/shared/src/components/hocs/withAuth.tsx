import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useAuth from 'shared/hooks/useAuth';
import useGoToPage from 'shared/hooks/useGoToPage';
import isServerSide from 'shared/server/is-server-side';

/**
 * Support client-side conditional redirecting based on the user's
 * authenticated state.
 *
 * @param WrappedComponent The component that this functionality
 * will be added to.
 * @param redirectLocation The location to redirect to.
 */
const withAuth = <P extends React.JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>,
  redirectLocation = '/login'
): React.FC<P> =>
  function Wrapped(props: P) {
    const { isLoading, isAuthenticated } = useAuth();
    const goToPage = useGoToPage();

    // Redirect as an effect, not during render, so re-renders while
    // unauthenticated don't keep re-triggering navigation (redirect loop).
    React.useEffect(() => {
      if (!isLoading && !isServerSide() && !isAuthenticated) {
        void goToPage(redirectLocation);
      }
    }, [isLoading, isAuthenticated, goToPage]);

    if (isLoading || (!isServerSide() && !isAuthenticated)) {
      return <PageLoadingSpinner />;
    }
    return <WrappedComponent {...props} />;
  };

export default withAuth;
