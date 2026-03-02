import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';

const useApplicationsQuery = <T = Application[]>(
  onlyMine?: boolean,
  select?: (applications: Application[]) => T
): UseQueryResult<T> => {
  const queryKey =
    onlyMine !== undefined
      ? `${BackendEndpoint.EMPLOYER_APPLICATIONS}?only_mine=${String(onlyMine)}`
      : BackendEndpoint.EMPLOYER_APPLICATIONS;

  return useQuery(queryKey, {
    select: select
      ? (applications: Application[]) => select(applications)
      : undefined,
    staleTime: Infinity,
    retryDelay: 3000,
    onError: useErrorHandler(),
  });
};
export default useApplicationsQuery;
