import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query/types/react/types';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import useYouthApplicationsListQuery from '../../hooks/backend/useYouthApplicationsListQuery';
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

/** Result type for the hook managing pending youth applications */
type UsePendingYouthApplicationsResultType = TableState<YouthApplication> & {
  /** The React Query result containing paginated application data */
  query: UseQueryResult<PaginatedResponse<YouthApplication>>;
  /** Total count of applications matching the query */
  count: number;
  /** Function to update the selected status filters */
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<ApplicationStatus[]>
  >;
};

const usePendingYouthApplications =
  (): UsePendingYouthApplicationsResultType => {
    const tableQuery = useApplicationTableQuery<YouthApplication>(
      useYouthApplicationsListQuery,
      DEFAULT_PENDING_STATUSES
    );

    return {
      ...tableQuery,
      setSelectedStatuses: () => {},
    };
  };

export default function YouthApplicationList(): JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(0);

  const {
    page: pendingPage,
    setPage: setPendingPage,
    setOrdering: setPendingOrdering,
    query: pendingQuery,
    count: pendingCount,
  } = usePendingYouthApplications();

  const {
    page: processedPage,
    setPage: setProcessedPage,
    setOrdering: setProcessedOrdering,
    query: processedQuery,
    count: processedCount,
  } = useApplicationTableQuery<YouthApplication>(
    useYouthApplicationsListQuery,
    PROCESSED_STATUSES
  );

  const columns = useYouthApplicationListColumns();

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
      <TabPanel index={1}>
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
