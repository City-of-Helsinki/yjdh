import axios from 'axios';
import { getYouthApplicationQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useYouthApplicationQuery = (
  id?: string,
  options?: UseQueryOptions<ActivatedYouthApplication>
): UseQueryResult<ActivatedYouthApplication> => {
  const handleError = useErrorHandler();
  return useQuery({
    queryKey: id ? getYouthApplicationQueryKey(id) : undefined,
    enabled: Boolean(id),
    staleTime: Infinity,
    onError: (error: unknown) => {
      const is404Error =
        axios.isAxiosError(error) && error.response?.status === 404;
      if (!is404Error) {
        handleError(error);
      }
    },
    ...options,
  });
};

export default useYouthApplicationQuery;
