import { getYouthApplicationQueryKey } from 'kesaseteli-shared/backend-api/backend-api';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { isError } from 'shared/utils/type-guards';

const useYouthApplicationQuery = (
  id?: string,
  options?: UseQueryOptions<ActivatedYouthApplication>
): UseQueryResult<ActivatedYouthApplication> => {
  const handleError = useErrorHandler(false);
  return useQuery({
    queryKey: id ? getYouthApplicationQueryKey(id) : undefined,
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

export default useYouthApplicationQuery;
