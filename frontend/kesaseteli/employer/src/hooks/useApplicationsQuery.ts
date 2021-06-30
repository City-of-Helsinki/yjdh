import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationsQuery = (): UseQueryResult<Application[], Error> => {
  const { axios } = useBackendAPI();
  return useQuery<Application[], Error>('applications', () =>
    handleResponse<Application[]>(axios.get(BackendEndpoint.APPLICATIONS))
  );
};

export default useApplicationsQuery;
