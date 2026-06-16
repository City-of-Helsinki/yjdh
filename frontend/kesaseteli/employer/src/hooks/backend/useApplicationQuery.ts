import Axios from 'axios';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = <T = Application>(
  id?: string,
  select?: (application: Application) => T
): UseQueryResult<T> => {
  const onError = useErrorHandler();
  return useQuery(`${BackendEndpoint.EMPLOYER_APPLICATIONS}${String(id)}/`, {
    enabled: Boolean(id),
    staleTime: Infinity,
    select: (application: Application) => {
      const formApplication = getFormApplication(application);
      return (select ? select(formApplication) : formApplication) as T;
    },
    /**
     * Suppress the generic error toast for 404 responses — the application
     * page handles this case by redirecting to the 404 page instead.
     */
    onError: (error: unknown) => {
      if (Axios.isAxiosError(error) && error.response?.status === 404) {
        return;
      }
      onError(error);
    },
  });
};

export default useApplicationQuery;
