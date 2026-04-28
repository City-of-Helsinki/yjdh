import { useRouter } from 'next/router';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';

import withOrganisation from './withOrganisation';

/**
 * Combined HOC for the Employer UI.
 * Ensures the user is both authenticated and has organization authorization.
 */
const withEmployerAuth = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>
): React.FC<P> => {
  const AuthenticatedComponent = withAuth(withOrganisation(WrappedComponent));
  return function Wrapped(props: P) {
    const { pathname } = useRouter();
    if (pathname === '/login' || pathname === '/no-organisation') {
      return <WrappedComponent {...props} />;
    }
    return <AuthenticatedComponent {...props} />;
  };
};

export default withEmployerAuth;
