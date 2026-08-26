import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

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

  useQuerySideEffect(query, {
    onError: handleError,
    onErrorPredicate: (error) => {
      // Suppress 404 errors — page handles redirect instead
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return true;
    },
  });

  return query;
};

export default useEmployerApplicationQuery;
