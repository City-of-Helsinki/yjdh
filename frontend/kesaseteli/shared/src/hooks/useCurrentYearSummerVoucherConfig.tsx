import useSummerVoucherConfigurationQuery from './useSummerVoucherConfigurationQuery';

export function useCurrentYearSummerVoucherConfig() {
  const query = useSummerVoucherConfigurationQuery();

  const currentYear = new Date().getFullYear();
  const currentConfiguration = query.data?.find((c) => c.year === currentYear);
  return { query, currentConfiguration, currentYear };
}
