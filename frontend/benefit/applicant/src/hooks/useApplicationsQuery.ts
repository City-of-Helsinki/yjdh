import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { ApplicationData } from 'benefit-shared/types/application';
import useBackendAPI from 'shared/hooks/useBackendAPI';

type Params = {
  status: string[];
  isArchived?: boolean;
  orderBy?: string;
  secondInstalmentStatus?: string;
};

const useApplicationsQuery = ({
  status,
  isArchived,
  orderBy = 'id',
  secondInstalmentStatus,
}: Params): UseQueryResult<ApplicationData[], Error> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<ApplicationData[], Error>({
    queryKey: [
      'applicationsList',
      ...status,
      orderBy,
      isArchived ? '1' : '0',
      secondInstalmentStatus ?? '',
    ],
    queryFn: async () => {
      const res = axios.get<ApplicationData[]>(
        BackendEndpoint.APPLICATIONS_SIMPLIFIED,
        {
          params: {
            status: status.join(','),
            archived_for_applicant: isArchived ?? undefined,
            order_by: orderBy,
            second_instalment_status: secondInstalmentStatus,
          },
        }
      );
      return handleResponse(res);
    },
    retry: false,
  });
};

export default useApplicationsQuery;
