import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query/types/react/types';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import { SESSION_STORAGE_KEYS } from '../../constants/session-storage-keys';
import useYouthApplicationsListQuery from '../../hooks/backend/useYouthApplicationsListQuery';
import useSessionStorageState from '../../hooks/useSessionStorageState';
import {
  ApplicationStatus,
  PaginatedResponse,
  YouthApplication,
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

/**
 * All possible statuses that fall under the "pending" category for youth applications.
 * Used to define the available options in the pending status search filter component.
 */
const YOUTH_PENDING_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

/**
 * The initial and default statuses selected for the pending youth applications list query.
 * Also used as default/fallback statuses when no specific filters are checked by the user.
 */
const DEFAULT_PENDING_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

/**
 * All statuses considered "processed" for youth applications
 */
const PROCESSED_STATUSES = [
  ApplicationStatus.ACCEPTED,
  ApplicationStatus.REJECTED,
];

export const useYouthApplicationListColumns =
  (): HdsHeader<YouthApplication>[] => {
    const { t } = useTranslation();
    const locale = useLocale();
    return [
      {
        key: 'ssn',
        headerName: t('common:applicationList.columns.ssn'),
        isSortable: false,
        transform: (row) => (
          <ActionCell
            value={row.social_security_number || '-'}
            row={row}
            type="youth"
          />
        ),
      },
      {
        key: 'name',
        headerName: t('common:applicationList.columns.applicantName'),
        isSortable: true,
        orderingField: 'first_name',
        transform: (row) =>
          `${String(row.first_name ?? '')} ${String(
            row.last_name ?? ''
          )}`.trim() || '-',
      },
      {
        key: 'summerVoucherSerialNumber',
        headerName: t(
          'common:applicationList.columns.summerVoucherSerialNumber'
        ),
        isSortable: false,
        transform: (row) => row.summer_voucher_serial_number || '-',
      },
      {
        key: 'targetGroup',
        headerName: t('common:applicationList.columns.targetGroup'),
        isSortable: true,
        orderingField: 'target_group',
        transform: (row) => row.target_group_name || '-',
      },
      {
        key: 'age',
        headerName: t('common:applicationList.columns.age'),
        isSortable: false,
        transform: (row) =>
          row.age && row.birth_year
            ? t('common:applicationList.ageFormat', {
                age: row.age,
                birthYear: row.birth_year,
              })
            : '-',
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
        key: 'created_at',
        headerName: t('common:applicationList.columns.receivedDate'),
        isSortable: true,
        orderingField: 'created_at',
        transform: (row) =>
          row.created_at
            ? new Date(row.created_at).toLocaleDateString(locale)
            : '-',
      },
    ];
  };

/** Result type for the hooks managing youth applications lists */
type UseYouthApplicationsResultType = TableState<YouthApplication> & {
  /** The React Query result containing paginated application data */
  query: UseQueryResult<PaginatedResponse<YouthApplication>>;
  /** Total count of applications matching the query */
  count: number;
  /** Function to update the selected status filters */
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<ApplicationStatus[]>
  >;
};

const useYouthApplications = (
  initialStatuses: ApplicationStatus[]
): UseYouthApplicationsResultType => {
  const [selectedStatuses, setSelectedStatuses] =
    useState<ApplicationStatus[]>(initialStatuses);

  const tableQuery = useApplicationTableQuery<YouthApplication>(
    useYouthApplicationsListQuery,
    selectedStatuses
  );

  const { setPage } = tableQuery;

  // Reset page when statuses change to avoid showing stale data
  useEffect(() => {
    setPage(0);
  }, [selectedStatuses, setPage]);

  return {
    ...tableQuery,
    setSelectedStatuses,
  };
};

export default function YouthApplicationList(): JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useSessionStorageState(
    SESSION_STORAGE_KEYS.YOUTH_APPLICATIONS_ACTIVE_TAB,
    0
  );

  const {
    page: pendingPage,
    setPage: setPendingPage,
    setOrdering: setPendingOrdering,
    setSelectedStatuses: setSelectedPendingStatuses,
    query: pendingQuery,
    count: pendingCount,
  } = useYouthApplications(DEFAULT_PENDING_STATUSES);

  const {
    page: processedPage,
    setPage: setProcessedPage,
    setOrdering: setProcessedOrdering,
    setSelectedStatuses: setSelectedProcessedStatuses,
    query: processedQuery,
    count: processedCount,
  } = useYouthApplications(PROCESSED_STATUSES);

  const columns = useYouthApplicationListColumns();

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
          ariaLabelledBy="youth-pending-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter
            id="youth-application-pending-status-filter"
            statuses={YOUTH_PENDING_STATUSES}
            defaultSelectedStatuses={DEFAULT_PENDING_STATUSES}
            onChange={setSelectedPendingStatuses}
          />
        </ApplicationListTable.FilterSection>
        <ApplicationListTable
          columns={columns}
          data={pendingQuery.data?.results ?? []}
          totalCount={pendingCount}
          page={pendingPage}
          setPage={setPendingPage}
          setOrdering={setPendingOrdering}
          isLoading={pendingQuery.isLoading}
        />
      </TabPanel>
      <TabPanel>
        <ApplicationListTable.FilterSection
          ariaLabelledBy="youth-processed-filters-heading"
          title={t('common:applicationList.filterTitle')}
        >
          <StatusFilter
            id="youth-application-processed-status-filter"
            statuses={PROCESSED_STATUSES}
            defaultSelectedStatuses={PROCESSED_STATUSES}
            onChange={setSelectedProcessedStatuses}
          />
        </ApplicationListTable.FilterSection>
        <ApplicationListTable
          columns={columns}
          data={processedQuery.data?.results ?? []}
          totalCount={processedCount}
          page={processedPage}
          setPage={setProcessedPage}
          setOrdering={setProcessedOrdering}
          isLoading={processedQuery.isLoading}
        />
      </TabPanel>
    </Tabs>
  );
}
