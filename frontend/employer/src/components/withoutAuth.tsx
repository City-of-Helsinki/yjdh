import withAuthRedirect from './withAuthRedirect';

/**
 * Require the user to be unauthenticated in order to render the component.
 * If the user is authenticated, forward to the given URL.
 */
const withoutAuth = <P,>(
  WrappedComponent: React.FC<P>,
  location = '/'
): typeof WrappedComponent =>
  withAuthRedirect({
    WrappedComponent,
    location,
    expectedAuth: false,
  });

export default withoutAuth;
