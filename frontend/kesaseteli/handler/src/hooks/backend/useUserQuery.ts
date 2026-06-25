import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';
import useIsRouting from 'shared/hooks/useIsRouting';
import User from 'shared/types/user';

const useUserQuery = <T = User>({
  refetchInterval,
  select,
  enabled = true,
}: Partial<UseQueryOptions<T>> = {}): UseQueryResult<T> => {
  const isRouting = useIsRouting();
  const goToPage = useGoToPage();
  const router = useRouter();
  const errorHandler = useErrorHandler({
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
  });

  const query = useQuery<T>({
    queryKey: [BackendEndpoint.USER],
    enabled: !!enabled && !isRouting,
    select,
    refetchInterval,
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [query, errorHandler]);

  return query;
};

export default useUserQuery;
