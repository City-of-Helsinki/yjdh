import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
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
  options?: UseQueryOptions<CreatedYouthApplication>
): UseQueryResult<CreatedYouthApplication> => {
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
