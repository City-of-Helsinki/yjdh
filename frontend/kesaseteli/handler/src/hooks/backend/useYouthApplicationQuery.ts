import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { getYouthApplicationQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';

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
      const is404Error =
        axios.isAxiosError(error) && error.response?.status === 404;
      if (!is404Error) {
        handleError(error);
      }
    }
  }, [query, handleError]);

  return query;
};

export default useYouthApplicationQuery;
