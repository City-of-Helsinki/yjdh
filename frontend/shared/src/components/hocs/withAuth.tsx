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
const withAuth = <P,>(
  WrappedComponent: React.FC<P>,
  redirectLocation = '/login'
): typeof WrappedComponent =>
  function Wrapped(props: P) {
    const { isLoading, isAuthenticated } = useAuth();
    const goToPage = useGoToPage();
    if (isLoading) {
      return <PageLoadingSpinner />;
    }
    if (!isServerSide() && !isAuthenticated) {
      void goToPage(redirectLocation);
      return <PageLoadingSpinner />;
    }
    return <WrappedComponent {...props} />;
  };

export default withAuth;
