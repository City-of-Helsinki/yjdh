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

  const { data: allApplications } = useApplicationsQuery({
    onlyMine: false,
    staleTime: Infinity,
  });

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

  // FIXME: If there are really many applications, it might be that they don't fit in 1 page. It could be okay if we get the first, the last year, and the current year.
  const availableYears = React.useMemo(() => {
    if (!allApplications) return [currentYear];
    const yearsFromApplications = allApplications.map((app) => {
      const appDateStr =
        app.submitted_at ||
        (app as typeof app & { created_at?: string }).created_at;
      return appDateStr ? appDateStr.slice(0, 4) : currentYear;
    });
    const uniqueYears = new Set([...yearsFromApplications, currentYear]);
    // Sort unique years in descending order
    return [...uniqueYears].sort((a, b) => b.localeCompare(a));
  }, [allApplications, currentYear]);

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
