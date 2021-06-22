import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useQuery, UseQueryResult } from 'react-query';

const useApplicationQuery = (id?: string): UseQueryResult<Application, Error> => {
  const { axios } = useBackendAPI();
  return useQuery<Application, Error>(['applications', id], () =>
    typeof id === 'undefined'
    ? Promise.reject(new Error('Missing id'))
    : handleResponse<Application>(axios.get(backendEndpoint.application(id))),
    {enabled: Boolean(id)}
  );
};

export default useApplicationQuery;
