import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { isError } from 'shared/utils/type-guards';

const useYouthApplicationQuery = (
  id?: string,
  options?: UseQueryOptions<YouthApplication>
): UseQueryResult<YouthApplication> => {
  const handleError = useErrorHandler(false);
  return useQuery({
    queryKey: `${BackendEndpoint.YOUTH_APPLICATIONS}${String(id)}/` as QueryKey,
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
