import equal from 'fast-deep-equal';
import { Checkbox, IconAngleDown, RadioButton } from 'hds-react';
import noop from 'lodash/noop';
import React, { useCallback, useEffect } from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import {
  actions,
  Cell,
  Column as ColumnType,
  HeaderProps,
  Row,
  SortingRule,
  TableCellProps,
  TableOptions,
  TableState,
  useExpanded,
  useFilters,
  UseFiltersColumnOptions,
  UseFiltersInstanceProps,
  useFlexLayout,
  useGlobalFilter,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersOptions,
  usePagination,
  useRowSelect,
  useSortBy,
  UseSortByColumnOptions,
  useTable,
} from 'react-table';

import {
  COLUMN_WIDTH,
  EXPANDER,
  MAIN_HEADER,
  RADIO_SELECTOR,
  SELECTOR,
} from './constants';
import { $RowWrapper, $Table, $TableCell, $TableWrapper } from './Table.sc';
import renderTableHead from './utils';

export type Column<D extends Record<string, unknown>> = ColumnType<D> &
  UseFiltersColumnOptions<D> &
  UseSortByColumnOptions<D>;

interface Setters<D extends Record<string, unknown>> {
  setGlobalFilter: UseGlobalFiltersInstanceProps<D>['setGlobalFilter'];
  setFilter: UseFiltersInstanceProps<D>['setFilter'];
  resetSelectedRows: () => void;
}

type TableToolsFn<D extends Record<string, unknown>> = (
  tableState: TableState<D>,
  setters: Setters<D>
) => React.ReactNode;

type TableProps<D extends Record<string, unknown>> = {
  data: D[];
  loading?: boolean;
  canSelectRows?: boolean;
  canSelectOneRow?: boolean;
  // not implemented
  // styleMainHeader?: boolean;
  // theme?: 'basic' | 'primary';
  globalFilter?: UseGlobalFiltersOptions<D>['globalFilter'];
  getCellProps?: (cell: Cell<D>) => Partial<TableCellProps>;
  renderTableToolsTop?: TableToolsFn<D>;
  renderTableToolsBottom?: TableToolsFn<D>;
  renderSubComponent?: (row: Row<D>) => React.ReactNode;
  renderMainHeader?: (props: HeaderProps<D>) => React.ReactNode;
  renderEmptyStateRow?: () => React.ReactNode;
  // Client-Side pagination
  renderPaginator?: (pagination: {
    pageIndex: number;
    pageCount: number;
    goToPage(pageIndex: number): void;
  }) => React.ReactNode;
  onSelectionChange?: (selectedRowIds: TableState<D>['selectedRowIds']) => void;
  onSortedColChange?: (
    sortedCol: TableState<D>['sortBy'][0] | undefined
  ) => void;
  onSortedColsChange?: (sortedCol: TableState<D>['sortBy']) => void;
  minimizeAllText?: string;
  noMatchesText?: string;
  sortBy?: SortingRule<D>[];
} & TableOptions<D>;

const Table = <D extends { id: string }>({
  columns,
  data: tableData,
  loading,
  canSelectRows,
  canSelectOneRow,
  // not implemented
  // styleMainHeader = true,
  // theme = 'primary',
  globalFilter = '',
  initialState,
  getCellProps = () => ({}),
  renderTableToolsTop,
  renderTableToolsBottom,
  renderSubComponent,
  renderMainHeader,
  renderEmptyStateRow,
  renderPaginator,
  onSelectionChange,
  onSortedColChange,
  onSortedColsChange,
  manualSortBy,
  minimizeAllText,
  noMatchesText,
  sortBy,
}: // eslint-disable-next-line sonarjs/cognitive-complexity
TableProps<D>): React.ReactElement => {
  const selectorCol: Column<D> = React.useMemo(
    () => ({
      Cell: ({ row }: { row: Row }) => {
        const { title, style, checked, onChange } =
          row.getToggleRowSelectedProps();
        return (
          <Checkbox
            id={`checkbox-${row.id}`}
            title={title}
            style={style}
            checked={checked}
            onChange={onChange}
          />
        );
      },
      Header: ({ getToggleAllRowsSelectedProps }) => {
        const { title, style, checked, onChange } =
          getToggleAllRowsSelectedProps();
        return (
          <Checkbox
            id="checkbox"
            title={title}
            style={style}
            checked={checked}
            onChange={onChange}
          />
        );
      },
      id: SELECTOR,
      width: COLUMN_WIDTH.XS,
      minWidth: COLUMN_WIDTH.XS,
    }),
    []
  );

  const radioSelectorCol: Column<D> = React.useMemo(
    () => ({
      Cell: ({
        row,
        toggleAllRowsSelected,
        toggleRowSelected,
      }: {
        row: Row;
        toggleAllRowsSelected: (selected: boolean) => void;
        toggleRowSelected: (rowId: string) => void;
      }) => {
        const { title, style, checked } = row.getToggleRowSelectedProps();
        return (
          <RadioButton
            id={`radio-${row.id}`}
            title={title}
            style={style}
            checked={checked}
            onChange={() => {
              toggleAllRowsSelected(false);
              toggleRowSelected(row.id);
            }}
          />
        );
      },
      id: RADIO_SELECTOR,
      width: COLUMN_WIDTH.XS,
      minWidth: COLUMN_WIDTH.XS,
    }),
    []
  );

  const expanderCol: Column<D> = React.useMemo(
    () => ({
      Cell: ({ row }: { row: Row }) => (
        <div {...row.getToggleRowExpandedProps()}>
          <IconAngleDown size="m" />
        </div>
      ),
      Header: ({ toggleAllRowsExpanded }) => (
        <button type="button" onClick={() => toggleAllRowsExpanded(false)}>
          {minimizeAllText}
        </button>
      ),
      id: EXPANDER,
      width: COLUMN_WIDTH.XS,
      minWidth: COLUMN_WIDTH.XS,
    }),
    [minimizeAllText]
  );

  const tableColumns = React.useMemo(() => {
    const headers = [
      ...(canSelectRows ? [selectorCol] : []),
      ...(canSelectOneRow ? [radioSelectorCol] : []),
      ...columns,
      ...(renderSubComponent ? [expanderCol] : []),
    ];

    const withMainHeader = [
      {
        Header: renderMainHeader,
        columns: headers,
        id: MAIN_HEADER,
      },
    ];

    return renderMainHeader ? withMainHeader : headers;
  }, [
    canSelectRows,
    canSelectOneRow,
    columns,
    renderSubComponent,
    renderMainHeader,
    selectorCol,
    radioSelectorCol,
    expanderCol,
  ]);

  const data = React.useMemo(() => tableData, [tableData]);

  const [dataState, setDataState] = React.useState<D[]>(data);

  const skipPageResetRef = React.useRef<boolean>();

  useEffect(() => {
    // After the table has updated, always remove the flag
    skipPageResetRef.current = false;
  });

  const {
    headerGroups,
    state,
    page,
    rows,
    pageCount,
    gotoPage,
    getTableProps,
    getTableBodyProps,
    prepareRow,
    setGlobalFilter,
    setFilter,
    dispatch,
  } = useTable(
    {
      columns: tableColumns,
      data: dataState,
      globalFilter,
      initialState: {
        ...(sortBy && { sortBy }),
      },
      manualSortBy,
      autoResetSortBy: !skipPageResetRef.current,
      autoResetSelectedRows: !skipPageResetRef.current,
      autoResetFilters: !skipPageResetRef.current,
      autoResetExpanded: !skipPageResetRef.current,
      getRowId: useCallback(
        (row: D, relativeIndex: number) =>
          row.id ? row.id : `${relativeIndex}`,
        []
      ),
    },
    useFilters,
    useGlobalFilter,
    useFlexLayout,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect
  );

  const resetSelectedRows = useCallback(() => {
    dispatch({ type: actions.resetSelectedRows });
  }, [dispatch]);

  useEffect(() => {
    gotoPage(0);
  }, [gotoPage, state.sortBy, state.filters, state.globalFilter]);

  const initialSortByState = initialState?.sortBy;
  const currentSortByState = state.sortBy;
  const didSortByChanged = !equal(initialSortByState, currentSortByState);

  useEffect(() => {
    if (didSortByChanged) void onSortedColChange?.(currentSortByState[0]);
  }, [currentSortByState, onSortedColChange, didSortByChanged]);

  useEffect(() => {
    if (didSortByChanged) void onSortedColsChange?.(currentSortByState);
  }, [currentSortByState, onSortedColsChange, didSortByChanged]);

  useEffect(() => {
    void onSelectionChange?.(state.selectedRowIds);
  }, [state.selectedRowIds, onSelectionChange]);

  useEffect(() => {
    const updateData = (newData: D[]): void => {
      // When data gets updated with this function, set a flag to disable all of the auto resetting
      skipPageResetRef.current = true;
      setDataState(newData);
    };

    updateData(data);
  }, [data]);

  const renderTableBody = (row: Row<D>): React.ReactNode => {
    prepareRow(row);
    return (
      <$RowWrapper isSelected={row.isSelected} key={row.index}>
        <div {...row.getRowProps()}>
          {row.cells.map((cell) => (
            <$TableCell {...cell.getCellProps([{}, getCellProps(cell)])}>
              {loading ? <LoadingSkeleton /> : cell.render('Cell')}
            </$TableCell>
          ))}
        </div>
        {renderSubComponent && row.isExpanded && (
          <div>{renderSubComponent(row)}</div>
        )}
      </$RowWrapper>
    );
  };

  const renderEmptyBody = (): React.ReactNode => {
    let emptyBodyContent: React.ReactNode = renderEmptyStateRow?.();

    if (state.globalFilter) emptyBodyContent = noMatchesText;
    if (loading) emptyBodyContent = <LoadingSkeleton />;

    return (
      <div role="row">
        <$TableCell>{emptyBodyContent}</$TableCell>
      </div>
    );
  };

  const renderTableTools = (fn?: TableToolsFn<D>): React.ReactNode =>
    fn?.(state, { setGlobalFilter, setFilter, resetSelectedRows });
  return (
    <div>
      {renderTableTools(renderTableToolsTop)}
      <$TableWrapper>
        <$Table {...getTableProps()}>
          <div>
            {
              // eslint-disable-next-line unicorn/no-array-callback-reference
              headerGroups.map(renderTableHead)
            }
          </div>
          <div {...getTableBodyProps()}>
            {
              // eslint-disable-next-line unicorn/no-array-callback-reference
              (renderPaginator ? page : rows).map(renderTableBody)
            }
            {rows.length === 0 && renderEmptyBody()}
          </div>
        </$Table>
      </$TableWrapper>
      {renderPaginator?.({
        pageCount,
        pageIndex: state.pageIndex,
        goToPage: gotoPage,
      })}
      {renderTableTools(renderTableToolsBottom)}
    </div>
  );
};

const defaultProps = {
  loading: false,
  canSelectRows: false,
  canSelectOneRow: false,
  globalFilter: undefined,
  getCellProps: () => ({}),
  renderTableToolsTop: undefined,
  renderSubComponent: undefined,
  renderMainHeader: undefined,
  renderEmptyStateRow: undefined,
  renderPaginator: undefined,
  renderTableToolsBottom: undefined,
  onSelectionChange: noop,
  onSortedColChange: noop,
  onSortedColsChange: noop,
  minimizeAllText: 'Minimize all',
  noMatchesText: 'No matches',
  sortBy: undefined,
};

Table.defaultProps = defaultProps;

export default Table;
