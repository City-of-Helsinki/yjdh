import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useEffect } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> => {
  const { axios, handleResponse } = useBackendAPI();
  const locale = useLocale();

  const errorHandler = useErrorHandler();
  const query = useQuery({
    queryKey: [BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, locale],
    queryFn: () =>
      handleResponse(
        axios.get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, {
          headers: {
            'Accept-Language': locale,
          },
        })
      ),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isError) {
      errorHandler(query.error);
    }
  }, [errorHandler, query]);

  return query;
};

export default useSummerVoucherConfigurationQuery;
