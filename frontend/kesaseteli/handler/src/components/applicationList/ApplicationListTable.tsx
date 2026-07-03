import { Pagination, Table } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { UseQueryResult } from 'react-query/types/react/types';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import {
  ApplicationStatus,
  BaseApplication,
  PaginatedResponse,
} from '../../types/application';

export const PAGE_SIZE = 20;
export const DEFAULT_ORDERING = '-created_at';

const $PaginationContainer = styled.div`
  margin-top: var(--spacing-xl);
`;

const $LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
`;

export type HdsHeader<T extends BaseApplication = BaseApplication> = {
  key: string;
  headerName: string;
  isSortable?: boolean;
  orderingField?: string;
  transform?: (row: T) => string | JSX.Element;
};

// Extract only the string keys from the model
type StringKeyOf<T> = Extract<keyof T, string>;

// Create a union of the exact key OR the key prefixed with "-"
type OrderDirection<T> = StringKeyOf<T> | `-${StringKeyOf<T>}`;

type ApplicationListTableProps<T extends BaseApplication = BaseApplication> = {
  columns: HdsHeader<T>[];
  data: T[];
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  setOrdering: (ordering: OrderDirection<T>) => void;
  isLoading: boolean;
  /** Initial ordering column key (e.g. 'created_at'). Descending by default. */
  defaultSortColumnKey?: OrderDirection<T>;
};

type TableState<T extends BaseApplication = BaseApplication> = {
  page: number;
  setPage: (page: number) => void;
  ordering: OrderDirection<T>;
  setOrdering: (ordering: OrderDirection<T>) => void;
};

/**
 * Hook to manage table state (page and ordering).
 */
export function useTableState<T extends BaseApplication = BaseApplication>(
  defaultOrdering = DEFAULT_ORDERING as OrderDirection<T>
): TableState<T> {
  const [page, setPage] = React.useState(0);
  const [ordering, setOrdering] = React.useState(defaultOrdering);

  // Changing the sort order should reset the user back to page 0!
  const handleOrderingChange = (newOrdering: OrderDirection<T>): void => {
    setOrdering(newOrdering);
    setPage(0);
  };

  return {
    page,
    setPage,
    ordering,
    setOrdering: handleOrderingChange,
  };
}

/**
 * Hook that combines table state management with the application list query logic.
 * This hook automatically handles pagination (limit/offset) and ordering for you.
 *
 * @param useQueryHook The query hook to use (e.g., useEmployerApplicationsListQuery).
 * @param status The status parameter to pass to the query hook.
 * @param defaultOrdering The default ordering string (defaults to '-created_at').
 *
 * @returns An object containing { page, setPage, ordering, setOrdering, query, count }
 */
export function useApplicationTableQuery<T extends BaseApplication>(
  useQueryHook: (params: {
    status: ApplicationStatus[];
    limit: number;
    offset: number;
    ordering: OrderDirection<T>;
  }) => UseQueryResult<PaginatedResponse<T>>,
  status: ApplicationStatus[],
  defaultOrdering: OrderDirection<T> = DEFAULT_ORDERING as OrderDirection<T>
): TableState<T> & {
  query: UseQueryResult<PaginatedResponse<T>>;
  count: number;
} {
  const tableState = useTableState(defaultOrdering);

  const query = useQueryHook({
    status,
    limit: PAGE_SIZE,
    offset: tableState.page * PAGE_SIZE,
    ordering: tableState.ordering,
  });

  const count = query.data?.count ?? 0;

  return {
    ...tableState, // spreads page, setPage, ordering, setOrdering...
    query,
    count,
  };
}

/**
 * ApplicationListTable component that displays a list of applications in a table.
 * HINT: Table state can be managed with useTableState hook.
 *
 * @example
 * const { page, setPage, ordering, setOrdering } = useTableState('-created_at');
 */
export default function ApplicationListTable<
  T extends BaseApplication = BaseApplication
>({
  columns,
  data,
  totalCount,
  page,
  setPage,
  setOrdering,
  isLoading,
  defaultSortColumnKey = DEFAULT_ORDERING as OrderDirection<T>,
}: ApplicationListTableProps<T>): JSX.Element {
  const { t } = useTranslation();
  const locale = useLocale();

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleSort = (
    order: 'asc' | 'desc',
    colKey: string,
    handleSortInternal: () => void
  ): void => {
    const col = columns.find((c) => c.key === colKey);
    const backendField = col?.orderingField;
    if (backendField) {
      setOrdering(
        (order === 'desc'
          ? `-${backendField}`
          : backendField) as OrderDirection<T>
      );
      setPage(0); // reset to first page on sort change
    }
    handleSortInternal();
  };

  // Build HDS-compatible column definitions from our HdsHeader schema.
  // Non-sortable columns (empty ordering key) have isSortable forced to false.
  const cols = columns.map((col) => {
    const { key, headerName, isSortable, transform, orderingField } = col;
    return {
      key,
      headerName,
      isSortable: isSortable && Boolean(orderingField),
      transform: transform ? (row: unknown) => transform(row as T) : undefined,
    };
  });

  const onPageChange = (e: React.MouseEvent, index: number): void => {
    e.preventDefault();
    setPage(index);
  };

  if (isLoading) {
    return (
      <$LoadingContainer>
        <PageLoadingSpinner />
      </$LoadingContainer>
    );
  }

  return (
    <>
      <Table
        cols={cols}
        rows={data}
        indexKey="id"
        renderIndexCol={false}
        initialSortingColumnKey={defaultSortColumnKey}
        initialSortingOrder="desc"
        onSort={handleSort}
        variant="dark"
        zebra
        caption={
          data.length === 0
            ? t('common:applicationList.noApplications')
            : undefined
        }
      />
      {pageCount > 1 && (
        <$PaginationContainer>
          <Pagination
            pageHref={() => '#'}
            pageIndex={page}
            pageCount={pageCount}
            paginationAriaLabel={t('common:utility.pagination')}
            onChange={onPageChange}
            language={locale}
          />
        </$PaginationContainer>
      )}
    </>
  );
}
