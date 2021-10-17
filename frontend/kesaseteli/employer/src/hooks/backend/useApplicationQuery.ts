import { BackendEndpoint } from 'kesaseteli/employer/backend-api/backend-api';
import useIsOperationPermitted from 'kesaseteli/employer/hooks/backend/useOperationPermitted';
import { useQuery, UseQueryResult } from 'react-query';
import Application from 'shared/types/application';
import { getFormApplication } from 'shared/utils/application.utils';

const useApplicationQuery = <T = Application>(
  id?: string,
  select?: (application: Application) => T
): UseQueryResult<T, Error> => {
  const operationPermitted = useIsOperationPermitted();
  return useQuery(`${BackendEndpoint.APPLICATIONS}${String(id)}/`, {
    enabled: Boolean(id) && operationPermitted,
    staleTime: Infinity,
    select: (application: Application) => {
      const formApplication = getFormApplication(application);
      return (select ? select(formApplication) : formApplication) as T;
    },
  });
};

export default useApplicationQuery;
