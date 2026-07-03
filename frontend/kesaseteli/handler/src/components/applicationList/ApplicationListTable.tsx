import { Pagination, Table } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import { BaseApplication } from '../../types/application';

export const PAGE_SIZE = 20;

const $PaginationContainer = styled.div`
  margin-top: var(--spacing-xl);
`;

const $LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
`;

export type HdsHeader<R extends BaseApplication = BaseApplication> = {
  key: string;
  headerName: string;
  isSortable?: boolean;
  orderingField?: string;
  transform?: (row: R) => string | JSX.Element;
};

type ApplicationListTableProps<R extends BaseApplication = BaseApplication> = {
  columns: HdsHeader<R>[];
  data: R[];
  totalCount: number;
  page: number;
  setPage: (page: number) => void;
  setOrdering: (ordering: string) => void;
  isLoading: boolean;
  /** Initial ordering column key (e.g. 'created_at'). Descending by default. */
  defaultSortColumnKey?: string;
};

// Extract only the string keys from the model
type StringKeyOf<T> = Extract<keyof T, string>;

// Create a union of the exact key OR the key prefixed with "-"
type OrderDirection<T> = StringKeyOf<T> | `-${StringKeyOf<T>}`;

type TableState<R extends BaseApplication = BaseApplication> = {
  page: number;
  setPage: (page: number) => void;
  ordering: OrderDirection<R>;
  setOrdering: (ordering: OrderDirection<R>) => void;
};

/**
 * Hook to manage table state (page and ordering).
 */
export function useTableState<R extends BaseApplication = BaseApplication>(
  defaultOrdering = '-created_at' as OrderDirection<R>
): TableState<R> {
  const [page, setPage] = React.useState(0);
  const [ordering, setOrdering] = React.useState(defaultOrdering);

  // Changing the sort order should reset the user back to page 0!
  const handleOrderingChange = (newOrdering: OrderDirection<R>) => {
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
 * ApplicationListTable component that displays a list of applications in a table.
 * HINT: Table state can be managed with useTableState hook.
 *
 * @example
 * const { page, setPage, ordering, setOrdering } = useTableState('-created_at');
 */
export default function ApplicationListTable<
  R extends BaseApplication = BaseApplication
>({
  columns,
  data,
  totalCount,
  page,
  setPage,
  setOrdering,
  isLoading,
  defaultSortColumnKey = 'created_at',
}: ApplicationListTableProps<R>): JSX.Element {
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
      setOrdering(order === 'desc' ? `-${backendField}` : backendField);
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
      transform: transform ? (row: unknown) => transform(row as R) : undefined,
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
