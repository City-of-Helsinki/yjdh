import { useQuery, UseQueryResult } from '@tanstack/react-query';
import Axios from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';
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

  useQuerySideEffect(query, {
    onError: errorHandler,
    onErrorPredicate: (error) => {
      /**
       * Suppress the generic error toast for 404 responses — the application
       * page handles this case by redirecting to the 404 page instead.
       */
      if (Axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      return true;
    },
  });

  return query;
};

export default useApplicationQuery;
