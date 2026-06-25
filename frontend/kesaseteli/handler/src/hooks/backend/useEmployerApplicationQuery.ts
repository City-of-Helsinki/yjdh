import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useEmployerApplicationQuery = <T = any>(
  id?: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey'>
): UseQueryResult<T> => {
  const handleError = useErrorHandler();

  const query = useQuery({
    queryKey: [`${BackendEndpoint.EMPLOYER_APPLICATIONS}${id ?? ''}/`],
    enabled: Boolean(id),
    staleTime: Infinity,
    ...options,
  });

  useEffect(() => {
    if (!query.isError) {
      return;
    }
    const is404Error =
      axios.isAxiosError(query.error) && query.error.response?.status === 404;
    if (!is404Error) {
      handleError(query.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error]);

  return query;
};

export default useEmployerApplicationQuery;
