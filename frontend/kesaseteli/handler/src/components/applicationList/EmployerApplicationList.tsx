import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import EmployerApplicationStatusType from 'kesaseteli-shared/types/employer-application-status-type';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query/types/react/types';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import { SESSION_STORAGE_KEYS } from '../../constants/session-storage-keys';
import useEmployerApplicationsListQuery from '../../hooks/backend/useEmployerApplicationsListQuery';
import useSessionStorageState from '../../hooks/useSessionStorageState';
import {
  APPLICATION_LIST_TYPES,
  EmployerApplication,
  PaginatedResponse,
} from '../../types/application';
import ActionCell from './ActionCell';
import ApplicationListTable, {
  HdsHeader,
  TableState,
  useApplicationTableQuery,
} from './ApplicationListTable';
import StatusFilter from './searchFilters/StatusFilter';

const $TabList = styled(TabList)`
  margin-bottom: 1rem;
`;

const EMPLOYER_PENDING_STATUSES = [
  EmployerApplicationStatus.SUBMITTED,
  EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
  EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
  EmployerApplicationStatus.APPLICATION_HANDLING,
];

/**
 * The initial and default statuses selected for the pending employer applications list query.
 * Also used as default/fallback statuses when no specific filters are checked by the user.
 */
const DEFAULT_PENDING_STATUSES = [
  EmployerApplicationStatus.SUBMITTED,
  EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

const PROCESSED_STATUSES = [
  EmployerApplicationStatus.PAYMENT_REVIEW,
  EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
  EmployerApplicationStatus.SENT_FOR_PAYMENT,
  EmployerApplicationStatus.REJECTED,
  EmployerApplicationStatus.CANCELLED,
];

export const useEmployerApplicationListColumns =
  (): HdsHeader<EmployerApplication>[] => {
    const { t } = useTranslation();
    const locale = useLocale();
    return [
      {
        key: 'summerVoucherSerialNumber',
        headerName: t(
          'common:applicationList.columns.summerVoucherSerialNumber'
        ),
        isSortable: false,
        transform: (row) => (
          <ActionCell
            value={
              row.summer_vouchers
                ?.map((v) => v.summer_voucher_serial_number)
                .filter(Boolean)
                .join(', ') || '-'
            }
            row={row}
            type="employer"
          />
        ),
      },
      {
        key: 'employeeName',
        headerName: t('common:applicationList.columns.applicantName'),
        isSortable: false,
        transform: (row) =>
          row.summer_vouchers
            ?.map((v) => v.employee_name)
            .filter(Boolean)
            .join(', ') || '-',
      },
      {
        key: 'companyName',
        headerName: t('common:applicationList.columns.companyName'),
        isSortable: true,
        orderingField: 'company__name',
        transform: (row) => row.company?.name || '-',
      },
      {
        key: 'businessId',
        headerName: t('common:applicationList.columns.businessId'),
        isSortable: true,
        orderingField: 'company__business_id',
        transform: (row) => row.company?.business_id || '-',
      },
      {
        key: 'status',
        headerName: t('common:applicationList.columns.status'),
        isSortable: true,
        orderingField: 'status',
        transform: (row) =>
          t(`common:applicationList.employer.status.${String(row.status)}`),
      },
      {
        key: 'submitted_at',
        headerName: t('common:applicationList.columns.receivedDate'),
        isSortable: true,
        orderingField: 'submitted_at',
        transform: (row) =>
          row.submitted_at
            ? new Date(row.submitted_at).toLocaleDateString(locale)
            : '-',
      },
    ];
  };

/** Result type for the hook managing employer applications */
type UseEmployerApplicationsResultType = TableState<EmployerApplication> & {
  /** The React Query result containing paginated application data */
  query: UseQueryResult<PaginatedResponse<EmployerApplication>>;
  /** Total count of applications matching the query */
  count: number;
  /** Function to update the selected status filters */
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<EmployerApplicationStatusType[]>
  >;
};

/**
 * Hook to manage the state and data query for employer applications.
 * Handles default and user-selected status filters.
 */
const useEmployerApplications = (
  initialStatuses: EmployerApplicationStatusType[]
): UseEmployerApplicationsResultType => {
  const [selectedStatuses, setSelectedStatuses] =
    useState<EmployerApplicationStatusType[]>(initialStatuses);

  const tableQuery = useApplicationTableQuery<EmployerApplication>(
    useEmployerApplicationsListQuery,
    selectedStatuses,
    '-submitted_at'
  );

  const { setPage } = tableQuery;

  useEffect(() => {
    setPage(0);
  }, [selectedStatuses, setPage]);

  return {
    ...tableQuery,
    setSelectedStatuses,
  };
};

export default function EmployerApplicationList(): JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useSessionStorageState(
    SESSION_STORAGE_KEYS.EMPLOYER_APPLICATIONS_ACTIVE_TAB,
    0
  );

  // Pending Tab States & Query
  const {
    page: pendingPage,
    setPage: setPendingPage,
    setOrdering: setPendingOrdering,
    setSelectedStatuses: setSelectedPendingStatuses,
    query: pendingQuery,
    count: pendingCount,
  } = useEmployerApplications(DEFAULT_PENDING_STATUSES);

  // Processed Tab States & Query
  const {
    page: processedPage,
    setPage: setProcessedPage,
    setOrdering: setProcessedOrdering,
    setSelectedStatuses: setSelectedProcessedStatuses,
    query: processedQuery,
    count: processedCount,
  } = useEmployerApplications(PROCESSED_STATUSES);

  const columns = useEmployerApplicationListColumns();

  return (
    <Tabs initiallyActiveTab={activeTab}>
      <$TabList>
        <Tab onClick={() => setActiveTab(0)}>
          {t('common:applicationList.tabs.pending')} ({pendingCount})
        </Tab>
        <Tab onClick={() => setActiveTab(1)}>
          {t('common:applicationList.tabs.processed')} ({processedCount})
        </Tab>
      </$TabList>
      <TabPanel>
        <ApplicationListTable.FilterSection
          ariaLabelledBy="employer-pending-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter<EmployerApplication>
            id="employer-application-pending-status-filter"
            statuses={EMPLOYER_PENDING_STATUSES}
            defaultSelectedStatuses={DEFAULT_PENDING_STATUSES}
            onChange={setSelectedPendingStatuses}
            listType={APPLICATION_LIST_TYPES.EMPLOYER}
          />
        </ApplicationListTable.FilterSection>
        <ApplicationListTable<EmployerApplication>
          columns={columns}
          data={pendingQuery.data?.results ?? []}
          totalCount={pendingCount}
          page={pendingPage}
          setPage={setPendingPage}
          setOrdering={setPendingOrdering}
          isLoading={pendingQuery.isLoading}
          defaultSortColumnKey="-submitted_at"
        />
      </TabPanel>
      <TabPanel>
        <ApplicationListTable.FilterSection
          ariaLabelledBy="employer-processed-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter<EmployerApplication>
            id="employer-application-processed-status-filter"
            statuses={PROCESSED_STATUSES}
            defaultSelectedStatuses={PROCESSED_STATUSES}
            onChange={setSelectedProcessedStatuses}
            listType={APPLICATION_LIST_TYPES.EMPLOYER}
          />
        </ApplicationListTable.FilterSection>
        <ApplicationListTable<EmployerApplication>
          columns={columns}
          data={processedQuery.data?.results ?? []}
          totalCount={processedCount}
          page={processedPage}
          setPage={setProcessedPage}
          setOrdering={setProcessedOrdering}
          isLoading={processedQuery.isLoading}
          defaultSortColumnKey="-submitted_at"
        />
      </TabPanel>
    </Tabs>
  );
}
