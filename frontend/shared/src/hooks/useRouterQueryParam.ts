import { useRouter } from 'next/router';
import React from 'react';
import { getFirstValue } from 'shared/utils/array.utils';

type RetVal = {
  isRouterLoading: boolean;
  value?: string;
};
const useRouterQueryParam = (queryParam: string): RetVal => {
  const router = useRouter();
  const [value, setValue] = React.useState<string | undefined>();
  const [isRouterLoading, setIsRouterLoading] = React.useState(true);

  React.useEffect(() => {
    if (router.isReady) {
      setValue(getFirstValue(router.query[queryParam]));
      setIsRouterLoading(false);
    }
  }, [router.isReady, router.query, queryParam]);
  return {
    isRouterLoading,
    value,
  };
};
export default useRouterQueryParam;
