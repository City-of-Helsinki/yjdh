import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';

const useApplicationsQuery = (
  enabled: boolean
): UseQueryResult<Application[], Error> =>
  useQuery(BackendEndpoint.APPLICATIONS, {
    enabled: useOperationPermitted() && enabled,
  });

export default useApplicationsQuery;
