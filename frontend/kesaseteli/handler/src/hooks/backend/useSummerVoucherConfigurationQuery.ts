import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useQuerySideEffect from 'shared/hooks/useQuerySideEffect';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> => {
  const errorHandler = useErrorHandler();

  const query = useQuery<SummerVoucherConfiguration[]>({
    queryKey: [BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION],
    staleTime: Infinity,
  });

  useQuerySideEffect(query, {
    onError: errorHandler,
  });

  return query;
};

export default useSummerVoucherConfigurationQuery;
