import withAuthRedirect from './withAuthRedirect';
/**
 * Require the user to be authenticated in order to render the component.
 * If the user isn't authenticated, forward to the given URL.
 */
const withAuth = <P,>(
  WrappedComponent: React.FC<P>,
  redirectLocation = '/login'
): typeof WrappedComponent =>
  withAuthRedirect({
    WrappedComponent,
    redirectLocation,
    expectedAuth: true,
  });

export default withAuth;
