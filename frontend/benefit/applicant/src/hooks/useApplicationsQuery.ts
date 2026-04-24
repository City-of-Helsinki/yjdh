import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useApplicationsQuery = ({
  status,
  isArchived,
  orderBy = 'id',
  secondInstalmentStatus
}: {
  status: string[];
  isArchived?: boolean;
  orderBy?: string;
  secondInstalmentStatus?: string;
}): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>(
    ['applicationsList', ...status, orderBy, isArchived ? '1' : '0', secondInstalmentStatus],
    async () => {
      const res = axios.get<ApplicationData[]>(
        `${BackendEndpoint.APPLICATIONS_SIMPLIFIED}`,
        {
          params: {
            status: status.join(','),
            archived_for_applicant: isArchived ?? undefined,
            order_by: orderBy,
            second_instalment_status: secondInstalmentStatus ?? undefined,
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
