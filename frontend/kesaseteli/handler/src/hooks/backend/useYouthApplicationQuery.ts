import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { getYouthApplicationQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

const useYouthApplicationQuery = (
  id?: string,
  options?: UseQueryOptions<ActivatedYouthApplication>
): UseQueryResult<ActivatedYouthApplication> => {
  const handleError = useErrorHandler();
  const query = useQuery({
    queryKey: [id ? getYouthApplicationQueryKey(id) : undefined],
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

export default useYouthApplicationQuery;
