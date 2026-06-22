import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import React from 'react';
import Application from 'shared/types/application';

import ApplicationTableContent from './ApplicationTableContent';
import {
  ApplicationTableContext,
  ApplicationTableContextType,
} from './ApplicationTableContext';
import ApplicationTableFilterBar from './ApplicationTableFilterBar';
import ApplicationTableHeader from './ApplicationTableHeader';

/** First year the Kesäseteli programme was in operation. */
const PROGRAMME_START_YEAR = 2022;

type ApplicationTableProps = {
  defaultShowOnlyMine?: boolean;
  /**
   * Called **in addition to** the internal toggle when the "show only mine"
   * filter is changed. The internal `showOnlyMine` state is always updated
   * regardless of whether this prop is provided.
   *
   * Use this to sync the toggle with external state (e.g. URL params),
   * not to replace the built-in behavior.
   *
   * @example
   * <ApplicationTable onToggleOnlyMine={() => setUrlParam('mine', !mine)} />
   */
  onToggleOnlyMine?: () => void;
  defaultSelectedYear?: string;
  /**
   * Called **in addition to** the internal year change when the year filter
   * is changed. The internal `selectedYear` state is always updated regardless
   * of whether this prop is provided.
   *
   * Use this to sync the selected year with external state (e.g. URL params),
   * not to replace the built-in behavior.
   *
   * @example
   * <ApplicationTable onChangeYear={(year) => setUrlParam('year', year)} />
   */
  onChangeYear?: (year: string) => void;
  itemsPerPage?: number;
  children?: React.ReactNode;
};

const ApplicationTable: React.FC<ApplicationTableProps> & {
  FilterBar: typeof ApplicationTableFilterBar;
  Table: typeof ApplicationTableContent;
  Header: typeof ApplicationTableHeader;
} = ({
  defaultShowOnlyMine = false,
  onToggleOnlyMine,
  defaultSelectedYear,
  onChangeYear,
  itemsPerPage = 15,
  children,
}) => {
  // Plain const (not useMemo): re-derived on every render so that when the
  // calendar year rolls over, the new string value propagates to the
  // availableYears useMemo below. String primitives compare by value, so
  // availableYears is still only recomputed when the year actually changes.
  const currentYear = new Date().getFullYear().toString();
  const [showOnlyMine, setShowOnlyMine] = React.useState(defaultShowOnlyMine);
  const [selectedYear, setSelectedYear] = React.useState<string>(
    defaultSelectedYear ?? currentYear
  );
  const [pageIndex, setPageIndex] = React.useState(0);

  const [totalCount, setTotalCount] = React.useState(0);
  const validatedItemsPerPage = Math.max(1, itemsPerPage);
  const pageCount = Math.max(1, Math.ceil(totalCount / validatedItemsPerPage));
  const currentPageIndex = Math.min(pageIndex, pageCount - 1);

  const onToggleOnlyMineHandler = React.useCallback(() => {
    setShowOnlyMine((prev) => !prev);
    setPageIndex(0);
    onToggleOnlyMine?.();
  }, [onToggleOnlyMine]);

  const onChangeYearHandler = React.useCallback(
    (year: string) => {
      setSelectedYear(year);
      setPageIndex(0);
      onChangeYear?.(year);
    },
    [onChangeYear]
  );

  const {
    data: paginatedData,
    isLoading,
    error,
  } = useApplicationsQuery<
    { count: number; results: Application[] },
    { count: number; results: Application[] }
  >({
    onlyMine: showOnlyMine,
    year: selectedYear,
    staleTime: 30_000,
    limit: validatedItemsPerPage,
    offset: currentPageIndex * validatedItemsPerPage,
  });

  React.useEffect(() => {
    if (paginatedData) {
      setTotalCount(paginatedData.count);
    }
  }, [paginatedData]);

  // Descending list from the current year back to the programme launch year.
  // Memoized so the stable reference doesn't invalidate the contextValue useMemo
  // on every render (which would cause all context consumers to re-render).
  const availableYears = React.useMemo(
    () =>
      Array.from(
        { length: Number(currentYear) - PROGRAMME_START_YEAR + 1 },
        (_, i) => String(Number(currentYear) - i)
      ),
    [currentYear]
  );

  const applications = React.useMemo<Application[]>(
    () => (paginatedData ? paginatedData.results : []),
    [paginatedData]
  );

  const contextValue = React.useMemo<ApplicationTableContextType>(
    () => ({
      applications,
      showOnlyMine,
      onToggleOnlyMine: onToggleOnlyMineHandler,
      selectedYear,
      onChangeYear: onChangeYearHandler,
      availableYears,
      isLoading,
      error,
      pageIndex: currentPageIndex,
      setPageIndex,
      pageCount,
    }),
    [
      applications,
      showOnlyMine,
      onToggleOnlyMineHandler,
      selectedYear,
      onChangeYearHandler,
      availableYears,
      isLoading,
      error,
      currentPageIndex,
      pageCount,
    ]
  );

  return (
    <ApplicationTableContext.Provider value={contextValue}>
      {children}
    </ApplicationTableContext.Provider>
  );
};

ApplicationTable.FilterBar = ApplicationTableFilterBar;
ApplicationTable.Table = ApplicationTableContent;
ApplicationTable.Header = ApplicationTableHeader;

export default ApplicationTable;
export { useApplicationTable } from './ApplicationTableContext';
