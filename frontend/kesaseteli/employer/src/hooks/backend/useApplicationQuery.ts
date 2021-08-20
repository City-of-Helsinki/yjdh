import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/employer-application';

const useApplicationQuery = (
  id: string
): UseQueryResult<Application, Error> => {
  const { axios, handleResponse } = useBackendAPI();
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
