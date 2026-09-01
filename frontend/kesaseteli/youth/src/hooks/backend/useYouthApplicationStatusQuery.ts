import axios from 'axios';
import { getYouthApplicationStatusQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import YouthApplicationStatusProps from 'kesaseteli-shared/types/youth-application-status-props';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useYouthApplicationStatusQuery = (
  id?: string,
  options?: UseQueryOptions<YouthApplicationStatusProps>
): UseQueryResult<YouthApplicationStatusProps> => {
  const handleError = useErrorHandler();
  return useQuery({
    queryKey: id ? getYouthApplicationStatusQueryKey(id) : undefined,
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

export default useYouthApplicationStatusQuery;
