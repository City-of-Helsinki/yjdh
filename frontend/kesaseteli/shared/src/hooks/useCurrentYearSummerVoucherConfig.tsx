import { UseQueryResult } from 'react-query';

import SummerVoucherConfiguration from '../types/summer-voucher-configuration';
import useSummerVoucherConfigurationQuery from './useSummerVoucherConfigurationQuery';

// eslint-disable-next-line import/prefer-default-export
export function useCurrentYearSummerVoucherConfig(): {
  query: UseQueryResult<SummerVoucherConfiguration[]>;
  currentConfiguration: SummerVoucherConfiguration | undefined;
  currentYear: number;
} {
  const query = useSummerVoucherConfigurationQuery();

  const currentYear = new Date().getFullYear();
  const currentConfiguration = query.data?.find((c) => c.year === currentYear);
  return { query, currentConfiguration, currentYear };
}
