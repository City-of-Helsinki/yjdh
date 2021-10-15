import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useIsOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = (
  id?: string
): UseQueryResult<Application, Error> => {
  const operationPermitted = useIsOperationPermitted();
  return useQuery(`${BackendEndpoint.APPLICATIONS}${String(id)}/`, {
    enabled: Boolean(id) && operationPermitted,
    staleTime: Infinity,
    select: (application: Application) => getFormApplication(application),
  });
};

export default useApplicationQuery;
