import { getYouthApplicationStatusQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import YouthApplicationStatus from 'kesaseteli-shared/types/youth-application-status';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { isError } from 'shared/utils/type-guards';

const useYouthApplicationStatusQuery = (
  id?: string,
  options?: UseQueryOptions<YouthApplicationStatus>
): UseQueryResult<YouthApplicationStatus> => {
  const handleError = useErrorHandler(false);
  return useQuery({
    queryKey: id ? getYouthApplicationStatusQueryKey(id) : undefined,
    enabled: Boolean(id),
    staleTime: Infinity,
    onError: (error: unknown) => {
      if (isError(error) && !error.message.includes('404')) {
        handleError(error);
      }
    },
    ...options,
  });
};

export default useYouthApplicationStatusQuery;
