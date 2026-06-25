import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { getYouthApplicationQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { isError } from 'shared/utils/type-guards';

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

  useEffect(() => {
    if (query.isError) {
      const { error } = query;
      if (isError(error) && !error.message.includes('404')) {
        handleError(error);
      }
    }
  }, [query, handleError]);

  return query;
};

export default useYouthApplicationQuery;
