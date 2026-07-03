import { Tab, TabList, TabPanel, Tabs } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import useLocale from 'shared/hooks/useLocale';

import useEmployerApplicationsListQuery from '../../hooks/backend/useEmployerApplicationsListQuery';
import {
  ApplicationStatus,
  EmployerApplication,
} from '../../types/application';
import ActionCell from './ActionCell';
import ApplicationListTable, {
  HdsHeader,
  PAGE_SIZE,
} from './ApplicationListTable';

const EMPLOYER_PENDING_STATUSES = [
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
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

export default function EmployerApplicationList(): JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(0);

  // Pending Tab States & Query
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingOrdering, setPendingOrdering] = useState('-created_at');
  const pendingQuery = useEmployerApplicationsListQuery({
    status: EMPLOYER_PENDING_STATUSES,
    limit: PAGE_SIZE,
    offset: pendingPage * PAGE_SIZE,
    ordering: pendingOrdering,
  });

  // Processed Tab States & Query
  const [processedPage, setProcessedPage] = useState(0);
  const [processedOrdering, setProcessedOrdering] = useState('-created_at');
  const processedQuery = useEmployerApplicationsListQuery({
    status: PROCESSED_STATUSES,
    limit: PAGE_SIZE,
    offset: processedPage * PAGE_SIZE,
    ordering: processedOrdering,
  });

  const pendingCount = pendingQuery.data?.count ?? 0;
  const processedCount = processedQuery.data?.count ?? 0;

  const columns = useEmployerApplicationListColumns();

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
          defaultSortColumnKey="submitted_at"
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
          defaultSortColumnKey="submitted_at"
        />
      </TabPanel>
    </Tabs>
  );
}
