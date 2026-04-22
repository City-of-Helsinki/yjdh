import withAuth from 'shared/components/hocs/withAuth';
import withOrganisation from './withOrganisation';

/**
 * Combined HOC for the Employer UI.
 * Ensures the user is both authenticated and has organization authorization.
 */
const withEmployerAuth = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.FC<P>
): React.FC<P> => withAuth(withOrganisation(WrappedComponent));

export default withEmployerAuth;
