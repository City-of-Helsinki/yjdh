import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useEffect } from 'react';
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

  const query = useQuery({
    queryKey: [BackendEndpoint.EMPLOYER_APPLICATIONS, { onlyMine }],
    queryFn: () =>
      handleResponse<Application[]>(
        axios.get(BackendEndpoint.EMPLOYER_APPLICATIONS, {
          params: {
            only_mine: onlyMine,
          },
        })
      ),
    select: select
      ? (applications: Application[]) => select(applications)
      : undefined,
    staleTime: Infinity,
    retryDelay: 3000,
  });

  useEffect(() => {
    if (query.isError) {
      const errorHandler = onError ?? defaultErrorHandler;
      errorHandler(query.error);
    }
  }, [query, defaultErrorHandler, onError]);

  return query;
};

export default useApplicationsQuery;
