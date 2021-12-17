import useOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import Application from 'shared/types/application';

const useApplicationsQuery = <T = Application[]>(
  enabled: boolean,
  select?: (applications: Application[]) => T
): UseQueryResult<T> =>
  useQuery(BackendEndpoint.APPLICATIONS, {
    enabled: useOperationPermitted() && enabled,
    select: select
      ? (applications: Application[]) => select(applications)
      : undefined,
    onError: useErrorHandler(),
  });
export default useApplicationsQuery;
