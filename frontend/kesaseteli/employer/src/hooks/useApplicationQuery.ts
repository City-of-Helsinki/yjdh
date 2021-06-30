import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationQuery = (
  id: string
): UseQueryResult<Application, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<Application, Error>(
    ['applications', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
            axios.get(`${BackendEndpoint.APPLICATIONS}${id}/`)
          ),
    { enabled: Boolean(id) }
  );
};

export default useApplicationQuery;
