import { QueryKey, useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useIsRouting from 'shared/hooks/useIsRouting';
import User from 'shared/types/user';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';

const useUserQuery = <T = User>({ refetchInterval, select }: UseQueryOptions<T> = {}): UseQueryResult<T> => {
  const isRouting = useIsRouting();
  return useQuery(BackendEndpoint.USER as QueryKey, {
    enabled: !isRouting,
    onError: useErrorHandler(false),
    select,
    refetchInterval,
  });
};
export default useUserQuery;
