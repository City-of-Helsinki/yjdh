import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import useOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';

const useApplicationsQuery = (
  enabled: boolean
): UseQueryResult<Application[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<Application[], Error>(
    'applications',
    () =>
      handleResponse<Application[]>(axios.get(BackendEndpoint.APPLICATIONS)),
    { enabled: useOperationPermitted() && enabled }
  );
};

export default useApplicationsQuery;
