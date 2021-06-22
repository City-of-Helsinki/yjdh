import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useMutation, UseMutationResult } from 'react-query';

const useUpdateApplicationQuery = (application: Application): UseMutationResult<Application, Errpr> => {
  const { axios } = useBackendAPI();
  const { id } = application;
  return useMutation<Application,Error>(
    ['application', id],
    () => handleResponse<Application>(axios.put(backendEndpoint.application(id), application)),
  );
};

export default useUpdateApplicationQuery;
