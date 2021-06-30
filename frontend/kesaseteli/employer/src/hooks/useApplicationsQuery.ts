import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationsQuery = (): UseQueryResult<Application[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<Application[], Error>('applications', () =>
    handleResponse<Application[]>(axios.get(BackendEndpoint.APPLICATIONS))
  );
};

export default useApplicationsQuery;
