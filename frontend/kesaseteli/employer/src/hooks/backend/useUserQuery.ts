import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import User from 'shared/types/user';

const useUserQuery = <T = User>({
  refetchInterval,
  select,
}: UseQueryOptions<T> = {}): UseQueryResult<T> => {
  const logoutQuery = useLogoutQuery();
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  return useQuery(BackendEndpoint.USER as QueryKey, {
    enabled: logoutQuery.isIdle,
    onError: (error) => handleError(error as Error, t, router, locale),
    select,
    refetchInterval,
  });
};
export default useUserQuery;
