import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  return useQuery(BackendEndpoint.USER as QueryKey, {
    enabled: !!enabled && !isRouting,
    onError: useErrorHandler({
      onServerError: () => goToPage(`${ROUTES.LOGIN}?error=true`),
      onAuthError: () => {
        const skipRedirectRoutes: string[] = [
          ROUTES.LOGIN,
          ROUTES.COOKIE_SETTINGS,
        ];
        if (!skipRedirectRoutes.includes(router.route)) {
          goToPage(`${ROUTES.LOGIN}?sessionExpired=true`);
        }
      },
    }),
    select,
    refetchInterval,
  });
};
export default useUserQuery;
