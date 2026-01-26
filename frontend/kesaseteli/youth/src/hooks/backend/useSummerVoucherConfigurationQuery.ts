import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useQuery, UseQueryResult } from 'react-query';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> =>
  useQuery(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, {
    staleTime: Infinity,
    onError: useErrorHandler(),
  });

export default useSummerVoucherConfigurationQuery;
