import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';

const useApplicationsQuery = <T = Application[]>(
  enabled: boolean,
  select?: (applications: Application[]) => T
): UseQueryResult<T, Error> =>
  useQuery(BackendEndpoint.APPLICATIONS, {
    enabled: useOperationPermitted() && enabled,
    select: select
      ? (applications: Application[]) => select(applications)
      : undefined,
  });

export default useApplicationsQuery;
