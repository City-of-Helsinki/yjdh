import useAuth from 'kesaseteli/employer/hooks/useAuth';
import { useRouter } from 'next/router';
import React from 'react';
import isServerSide from 'shared/server/is-server-side';

const DefaultLoadingFallback = (): React.ReactElement<unknown> => (
  <p>Uudelleenohjataan...</p>
);

type Props<P> = {
  WrappedComponent: React.FC<P>;
  LoadingComponent?: React.FC<unknown>;
  expectedAuth: boolean;
  redirectLocation: string;
};
/**
 * Support client-side conditional redirecting based on the user's
 * authenticated state.
 *
 * @param WrappedComponent The component that this functionality
 * will be added to.
 * @param LoadingComponent The component that will be rendered while
 * the auth state is loading.
 * @param expectedAuth Whether the user should be authenticated for
 * the component to be rendered.
 * @param redirectLocation The location to redirect to.
 */
const withAuthRedirect = <P,>({
  WrappedComponent,
  LoadingComponent = DefaultLoadingFallback,
  expectedAuth,
  redirectLocation,
}: Props<P>): typeof WrappedComponent => (props: P) => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) {
    return <LoadingComponent />;
  }
  if (!isServerSide() && expectedAuth !== isAuthenticated) {
    // eslint-disable-next-line no-void
    void router.push(redirectLocation);
    return null;
  }
  return <WrappedComponent {...props} />;
};

export default withAuthRedirect;
