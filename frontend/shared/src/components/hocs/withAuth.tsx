import { useRouter } from 'next/router';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useAuth from 'shared/hooks/useAuth';
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
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    if (isLoading) {
      return <PageLoadingSpinner />;
    }
    if (!isServerSide() && !isAuthenticated) {
      void router.push(redirectLocation);
      return <PageLoadingSpinner />;
    }
    return <WrappedComponent {...props} />;
  };

export default withAuth;
