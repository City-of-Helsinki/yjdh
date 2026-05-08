import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import SummerVoucherConfiguration from 'kesaseteli-shared/types/summer-voucher-configuration';
import { useTranslation } from 'next-i18next';
import { useQuery, UseQueryResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useErrorHandler from 'shared/hooks/useErrorHandler';

const useSummerVoucherConfigurationQuery = (): UseQueryResult<
  SummerVoucherConfiguration[]
> => {
  const { axios, handleResponse } = useBackendAPI();
  const { i18n } = useTranslation();
  return useQuery(
    [BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION, i18n.language],
    () =>
      handleResponse(axios.get(BackendEndpoint.SUMMER_VOUCHER_CONFIGURATION)),
    {
      staleTime: Infinity,
      onError: useErrorHandler(),
    }
  );
};

export default useSummerVoucherConfigurationQuery;
