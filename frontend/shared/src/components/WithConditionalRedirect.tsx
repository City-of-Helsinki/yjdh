import { NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import isServerSide from 'shared/server/is-server-side';

/**
 * Support conditional redirecting, both server-side and client-side.
 *
 * Client-side, we can use next/router. But that doesn't exist on the server.
 * So on the server we must do an HTTP redirect. This component handles
 * the logic to detect whether on the server and client and redirect
 * appropriately.
 *
 * @param Page The component that this functionality
 * will be added to.
 * @param clientCondition A function that returns a boolean representing
 * whether to perform the redirect. It will always be called, even on
 * the server. This is necessary so that it can have hooks in it (since
 * can't be inside conditionals and must always be called).
 * @param serverCondition A function that returns a boolean representing
 * whether to perform the redirect. It is only called on the server. It
 * accepts a Next page context as a parameter so that the request can
 * be examined and the response can be changed.
 * @param location The location to redirect to.
 */
const withConditionalRedirect = <P,>(
  Page: NextPage<P>,
  clientCondition: () => boolean,
  serverCondition: (context: NextPageContext) => boolean,
  location: string
): React.FunctionComponent<P> => {
  const WithConditionalRedirectWrapper = (props: P): JSX.Element => {
    const router = useRouter();
    const redirectCondition = clientCondition();
    if (isServerSide() && redirectCondition) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.push(location);
      return <></>;
    }
    return <Page {...props} />;
  };

  WithConditionalRedirectWrapper.getInitialProps = async (
    ctx: NextPageContext
  ): Promise<P | Record<string, unknown>> => {
    if (!isServerSide() && ctx.res && serverCondition(ctx)) {
      ctx.res.writeHead(302, { Location: location });
      ctx.res.end();
    }

    const componentProps = await Page.getInitialProps?.(ctx);

    return { ...componentProps };
  };

  return WithConditionalRedirectWrapper;
};

export default withConditionalRedirect;
