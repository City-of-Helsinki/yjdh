import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';
import useIsRouting from 'shared/hooks/useIsRouting';
import User from 'shared/types/user';

const useUserQuery = <T = User>({
  refetchInterval,
  select,
  enabled = true,
}: UseQueryOptions<T> = {}): UseQueryResult<T> => {
  const isRouting = useIsRouting();
  const goToPage = useGoToPage();
  return useQuery(BackendEndpoint.USER as QueryKey, {
    enabled: !!enabled && !isRouting,
    onError: useErrorHandler({
      onServerError: () => goToPage('/login?error=true'),
      onAuthError: () => {
        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/no-organisation')
        ) {
          goToPage('/login?sessionExpired=true');
        }
      },
    }),
    select,
    refetchInterval,
  });
};
export default useUserQuery;
