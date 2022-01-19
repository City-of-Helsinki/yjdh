import useLogoutQuery from 'tet/admin/hooks/backend/useLogoutQuery';
import { BackendEndpoint } from 'tet/admin/backend-api/backend-api';
import { QueryKey, useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useIsRouting from 'shared/hooks/useIsRouting';
import User from 'shared/types/user';

const useUserQuery = <T = User>({ refetchInterval, select }: UseQueryOptions<T> = {}): UseQueryResult<T> => {
  const logoutQuery = useLogoutQuery();
  const isRouting = useIsRouting();
  return useQuery(BackendEndpoint.USER as QueryKey, {
    enabled: logoutQuery.isIdle && !isRouting,
    onError: useErrorHandler(false),
    select,
    refetchInterval,
  });
};
export default useUserQuery;
