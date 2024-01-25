import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = ({
  status,
  isArchived,
  orderBy = 'id',
}: {
  status: string[];
  isArchived?: boolean;
  orderBy?: string;
}): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status, orderBy],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_SIMPLIFIED}`,
        {
          params: {
            status: status.join(','),
            archived_for_applicant: isArchived ?? undefined,
            order_by: orderBy,
          },
        }
      );
      return handleResponse(res);
    },
    {
      retry: false,
    }
  );
};

export default useApplicationsQuery;
