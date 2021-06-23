import withAuthRedirect from './withAuthRedirect';

/**
 * Require the user to be unauthenticated in order to render the component.
 * If the user is authenticated, forward to the given URL.
 */
const withoutAuth = <P,>(
  WrappedComponent: React.FC<P>,
  redirectLocation = '/'
): typeof WrappedComponent =>
  withAuthRedirect({
    WrappedComponent,
    redirectLocation,
    expectedAuth: false,
  });

export default withoutAuth;
