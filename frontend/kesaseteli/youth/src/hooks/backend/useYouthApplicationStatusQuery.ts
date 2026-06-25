import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import axios from 'axios';
import { getYouthApplicationStatusQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import YouthApplicationStatus from 'kesaseteli-shared/types/youth-application-status';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';

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

export default useYouthApplicationStatusQuery;
