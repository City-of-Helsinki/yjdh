import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';

const useApplicationsQuery = <T = Application[]>(
  enabled: boolean,
  select?: (applications: Application[]) => T
): UseQueryResult<T, Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  return useQuery(BackendEndpoint.APPLICATIONS, {
    enabled: useOperationPermitted() && enabled,
    select: select
      ? (applications: Application[]) => select(applications)
      : undefined,
    onError: (error) => handleError(error, t, router, locale),
  });
};
export default useApplicationsQuery;
