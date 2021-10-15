import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useBackendAPI from 'kesaseteli/employer/hooks/backend/useBackendAPI';
import useIsOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = (
  id?: string
): UseQueryResult<Application, Error> => {
  const { axios, handleResponse } = useBackendAPI();
  const operationPermitted = useIsOperationPermitted();
  return useQuery(
    ['applications', id],
    () =>
      !id
        ? Promise.reject(new Error('Missing id'))
        : handleResponse<Application>(
            axios.get(`${BackendEndpoint.APPLICATIONS}${id}/`)
          ),
    {
      enabled: Boolean(id) && operationPermitted,
      staleTime: Infinity,
      select: (application: Application) => getFormApplication(application),
    }
  );
};

export default useApplicationQuery;
