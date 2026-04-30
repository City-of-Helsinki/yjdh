import useSummerVoucherConfigurationQuery from './useSummerVoucherConfigurationQuery';

type QueryResult = ReturnType<typeof useSummerVoucherConfigurationQuery>;

function useCurrentYearSummerVoucherConfig(): {
  query: QueryResult;
  currentConfiguration: NonNullable<QueryResult['data']>[number] | undefined;
  currentYear: number;
} {
  const query = useSummerVoucherConfigurationQuery();

  const currentYear = new Date().getFullYear();
  const currentConfiguration = query.data?.find((c) => c.year === currentYear);
  return { query, currentConfiguration, currentYear };
}

export default useCurrentYearSummerVoucherConfig;
