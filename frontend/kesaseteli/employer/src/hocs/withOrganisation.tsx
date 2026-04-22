import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useAuth from 'shared/hooks/useAuth';
import useGoToPage from 'shared/hooks/useGoToPage';
import { isError } from 'shared/utils/type-guards';

/**
 * HOC that ensures the user has organization authorization.
 * Redirects to /no-organisation if the user is authenticated but lacks organization info or receives a 403.
 */
const withOrganisation = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>
): React.FC<P> =>
  function Wrapped(props: P) {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const goToPage = useGoToPage();

    const {
      data: company,
      isLoading: isCompanyLoading,
      isSuccess: isCompanySuccess,
      error: companyError,
    } = useCompanyQuery();

    const isForbidden = (err: unknown): boolean =>
      isError(err) &&
      (err.message.includes('403') || err.message.includes('Forbidden'));

    const isNoOrganisation = isCompanySuccess && !company?.name;
    const isAuthError = isForbidden(companyError);

    React.useEffect(() => {
      // Redirect to no-organisation only if authenticated but unauthorized for organizations
      if (
        isAuthenticated &&
        !isCompanyLoading &&
        (isNoOrganisation || isAuthError)
      ) {
        void goToPage('/no-organisation');
      }
    }, [
      isAuthenticated,
      isCompanyLoading,
      isNoOrganisation,
      isAuthError,
      goToPage,
    ]);

    // Show loading spinner while determining status
    if (isAuthLoading || (isAuthenticated && isCompanyLoading)) {
      return <PageLoadingSpinner />;
    }

    // Prevent rendering the wrapped component if we're about to redirect
    if (isAuthenticated && (isNoOrganisation || isAuthError)) {
      return <PageLoadingSpinner />;
    }

    return <WrappedComponent {...props} />;
  };

export default withOrganisation;
