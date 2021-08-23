import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/employer-application';

const useApplicationsQuery = (): UseQueryResult<Application[], Error> => {
  const { axios, handleResponse } = useBackendAPI();
  return useQuery<Application[], Error>('applications', () =>
    handleResponse<Application[]>(axios.get(BackendEndpoint.APPLICATIONS))
  );
};

export default useApplicationsQuery;
