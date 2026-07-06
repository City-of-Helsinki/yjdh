import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query/types/react/types';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import useEmployerApplicationsListQuery from '../../hooks/backend/useEmployerApplicationsListQuery';
import {
  ApplicationStatus,
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
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

/**
 * The initial and default statuses selected for the pending employer applications list query.
 * Also used as default/fallback statuses when no specific filters are checked by the user.
 */
const DEFAULT_PENDING_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

const PROCESSED_STATUSES = [
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
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
          t(`common:applicationList.status.${String(row.status)}`),
      },
      {
        key: 'submitted_at',
        headerName: t('common:applicationList.columns.receivedDate'),
        isSortable: true,
        orderingField: 'created_at',
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
    React.SetStateAction<ApplicationStatus[]>
  >;
};

/**
 * Hook to manage the state and data query for employer applications.
 * Handles default and user-selected status filters.
 */
const useEmployerApplications = (
  initialStatuses: ApplicationStatus[]
): UseEmployerApplicationsResultType => {
  const [selectedStatuses, setSelectedStatuses] =
    useState<ApplicationStatus[]>(initialStatuses);

  const tableQuery = useApplicationTableQuery<EmployerApplication>(
    useEmployerApplicationsListQuery,
    selectedStatuses
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

  const [activeTab, setActiveTab] = useState(0);

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
    <Tabs index={activeTab} onChange={setActiveTab}>
      <$TabList>
        <Tab index={0}>
          {t('common:applicationList.tabs.pending')} ({pendingCount})
        </Tab>
        <Tab index={1}>
          {t('common:applicationList.tabs.processed')} ({processedCount})
        </Tab>
      </$TabList>
      <TabPanel index={0}>
        <ApplicationListTable.FilterSection
          ariaLabelledBy="employer-pending-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter
            id="employer-application-pending-status-filter"
            statuses={EMPLOYER_PENDING_STATUSES}
            defaultSelectedStatuses={DEFAULT_PENDING_STATUSES}
            onChange={setSelectedPendingStatuses}
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
      <TabPanel index={1}>
        <ApplicationListTable.FilterSection
          ariaLabelledBy="employer-processed-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter
            id="employer-application-processed-status-filter"
            statuses={PROCESSED_STATUSES}
            defaultSelectedStatuses={PROCESSED_STATUSES}
            onChange={setSelectedProcessedStatuses}
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
