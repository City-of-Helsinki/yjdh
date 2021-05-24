import { NextRouter, useRouter } from 'next/router';
import * as React from 'react';

const useRouterClearQueryParams = (): NextRouter => {
  const router = useRouter();
  const { pathname } = router;
  React.useEffect(() => window.history.replaceState(null, '', pathname), [
    pathname,
  ]);
  return router;
};

export default useRouterClearQueryParams;
