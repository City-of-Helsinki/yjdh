import backendEndpoint from 'kesaseteli/employer/backend-api/backend-endpoints';
import handleResponse from 'kesaseteli/employer/backend-api/handle-response';
import useBackendAPI from 'kesaseteli/employer/hooks/useBackendAPI';
import Application from 'kesaseteli/employer/types/application';
import { useMutation, UseMutationResult } from 'react-query';

const useCreateApplicationQuery = (): UseMutationResult<unknown, Error, void> => {
  const { axios } = useBackendAPI();
  return useMutation<Application, Error, void>(
    'createApplication',
    () => handleResponse<Application>(axios.post(backendEndpoint.applications, {})),
  );
};

export default useCreateApplicationQuery;
