import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import type { TargetGroup } from 'kesaseteli-shared/types/target-group';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import { isError } from 'shared/utils/type-guards';

const useTargetGroupsQuery = (): UseQueryResult<TargetGroup[]> => {
  const handleError = useErrorHandler();
  return useQuery(BackendEndpoint.TARGET_GROUPS, {
    staleTime: Infinity,
    onError: (error: unknown) => {
      if (isError(error)) {
        handleError(error);
      }
    },
  });
};

export default useTargetGroupsQuery;
