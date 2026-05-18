import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useLocale from 'shared/hooks/useLocale';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> => {
  const { axios, handleResponse } = useBackendAPI();
  const locale = useLocale();
  return useQuery(
    [BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, locale],
    () =>
      handleResponse(
        axios.get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, {
          headers: {
            'Accept-Language': locale,
          },
        })
      ),
    {
      staleTime: Infinity,
      onError: useErrorHandler(),
    }
  );
};

export default useSummerVoucherConfigurationQuery;
