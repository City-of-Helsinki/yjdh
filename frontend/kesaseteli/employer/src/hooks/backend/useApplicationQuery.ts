import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = <T = Application>(
  id?: string,
  select?: (application: Application) => T
): UseQueryResult<T> => {
  const errorHandler = useErrorHandler();

  const query = useQuery({
    queryKey: [
      id ? `${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/` : undefined,
    ],
    enabled: Boolean(id),
    staleTime: Infinity,
    select: (application: Application) => {
      const formApplication = getFormApplication(application);
      return (select ? select(formApplication) : formApplication) as T;
    },
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [query, errorHandler]);

  return query;
};

export default useApplicationQuery;
