import { useSearchParams } from 'next/navigation';
import { getFirstValue } from 'shared/utils/array.utils';

type RetVal = {
  isRouterLoading: boolean;
  value?: string;
};

const useRouterQueryParam = (queryParam: string): RetVal => {
  const searchParams = useSearchParams();
  const value = searchParams.get(queryParam) ?? undefined;

  return {
    isRouterLoading: false,
    value,
  };
};

export default useRouterQueryParam;
