import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';

const useApplicationsQuery = <T = Application[]>(
  onlyMine?: boolean,
  select?: (applications: Application[]) => T,
  onError?: (error: Error | unknown) => void
): UseQueryResult<T> => {
  const { axios, handleResponse } = useBackendAPI();
  const defaultErrorHandler = useErrorHandler();

  return useQuery(
    [BackendEndpoint.EMPLOYER_APPLICATIONS, { onlyMine }],
    () =>
      handleResponse<Application[]>(
        axios.get(BackendEndpoint.EMPLOYER_APPLICATIONS, {
          params: {
            only_mine: onlyMine,
          },
        })
      ),
    {
      select: select
        ? (applications: Application[]) => select(applications)
        : undefined,
      staleTime: Infinity,
      retryDelay: 3000,
      onError: onError ?? defaultErrorHandler,
    }
  );
};

export default useApplicationsQuery;
