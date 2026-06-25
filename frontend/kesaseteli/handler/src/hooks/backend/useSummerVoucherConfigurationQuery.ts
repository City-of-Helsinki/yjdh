import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useEffect } from 'react';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> => {
  const errorHandler = useErrorHandler();

  const query = useQuery<SummerVoucherConfiguration[]>({
    queryKey: [BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION],
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [query, errorHandler]);

  return query;
};

export default useSummerVoucherConfigurationQuery;
