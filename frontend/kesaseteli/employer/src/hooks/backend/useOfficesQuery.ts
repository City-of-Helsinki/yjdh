import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

export type Office = {
  name: string;
};

const useOfficesQuery = (): UseQueryResult<Office[]> => {
  const { data: company } = useCompanyQuery();
  const companyIdentifier = company?.id || company?.business_id;

  const errorHandler = useErrorHandler({
    onServerError: () => {},
    onAuthError: () => {},
  });

  const query = useQuery<Office[], Error>({
    queryKey: [BackendEndpoint.COMPANY, companyIdentifier, 'offices'],
    queryFn: async () => {
      const response = await axios.get<Office[]>(
        `${BackendEndpoint.COMPANY}${companyIdentifier}/offices/`
      );
      return response.data;
    },
    enabled: Boolean(companyIdentifier),
    staleTime: Infinity,
  });

  useQuerySideEffect(query, {
    onError: errorHandler,
  });

  return query;
};

export default useOfficesQuery;
