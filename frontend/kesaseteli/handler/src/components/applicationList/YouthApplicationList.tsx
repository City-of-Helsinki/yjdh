import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import useLocale from 'shared/hooks/useLocale';

import useYouthApplicationsListQuery from '../../hooks/backend/useYouthApplicationsListQuery';
import { ApplicationStatus, YouthApplication } from '../../types/application';
import ActionCell from './ActionCell';
import ApplicationListTable, {
  HdsHeader,
  PAGE_SIZE,
} from './ApplicationListTable';

const YOUTH_PENDING_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
];

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

export default function YouthApplicationList(): JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(0);

  // Pending Tab States & Query
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingOrdering, setPendingOrdering] = useState('-created_at');
  const pendingQuery = useYouthApplicationsListQuery({
    status: YOUTH_PENDING_STATUSES,
    limit: PAGE_SIZE,
    offset: pendingPage * PAGE_SIZE,
    ordering: pendingOrdering,
  });

  // Processed Tab States & Query
  const [processedPage, setProcessedPage] = useState(0);
  const [processedOrdering, setProcessedOrdering] = useState('-created_at');
  const processedQuery = useYouthApplicationsListQuery({
    status: PROCESSED_STATUSES,
    limit: PAGE_SIZE,
    offset: processedPage * PAGE_SIZE,
    ordering: processedOrdering,
  });

  const pendingCount = pendingQuery.data?.count ?? 0;
  const processedCount = processedQuery.data?.count ?? 0;

  const columns = useYouthApplicationListColumns();

  return (
    <Tabs index={activeTab} onChange={setActiveTab}>
      <TabList style={{ marginBottom: '1rem' }}>
        <Tab index={0}>
          {t('common:applicationList.tabs.pending')} ({pendingCount})
        </Tab>
        <Tab index={1}>
          {t('common:applicationList.tabs.processed')} ({processedCount})
        </Tab>
      </TabList>
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
