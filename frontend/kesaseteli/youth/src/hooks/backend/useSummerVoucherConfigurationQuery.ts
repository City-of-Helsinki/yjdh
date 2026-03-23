import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import useErrorHandler from 'kesaseteli-shared/hooks/useErrorHandler';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useQuery, UseQueryResult } from 'react-query';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> =>
  useQuery(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, {
    staleTime: Infinity,
    onError: useErrorHandler(),
  });

export default useSummerVoucherConfigurationQuery;
