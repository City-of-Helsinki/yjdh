import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { getYouthApplicationStatusQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import YouthApplicationStatus from 'kesaseteli-shared/types/youth-application-status';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

const useYouthApplicationStatusQuery = (
  id?: string,
  options?: UseQueryOptions<YouthApplicationStatus>
): UseQueryResult<YouthApplicationStatus> => {
  const handleError = useErrorHandler();
  const query = useQuery({
    queryKey: [id ? getYouthApplicationStatusQueryKey(id) : undefined],
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

export default useYouthApplicationStatusQuery;
