import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import handleError from 'shared/error-handler/error-handler';
import useLocale from 'shared/hooks/useLocale';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = <T = Application>(
  id?: string,
  select?: (application: Application) => T
): UseQueryResult<T, Error> => {
  const { t } = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  return useQuery(`${BackendEndpoint.APPLICATIONS}${String(id)}/`, {
    enabled: Boolean(id),
    staleTime: Infinity,
    select: (application: Application) => {
      const formApplication = getFormApplication(application);
      return (select ? select(formApplication) : formApplication) as T;
    },
    onError: (error) => handleError(error, t, router, locale),
  });
};

export default useApplicationQuery;
