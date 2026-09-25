import { UseQueryResult } from '@tanstack/react-query';
import { Checkbox, Tab, TabList, TabPanel, Tabs, Tooltip } from 'hds-react';
import { YouthApplicationStatus } from 'kesaseteli-shared/constants/youth-application-status';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useLocale from 'shared/hooks/useLocale';
import styled from 'styled-components';

import { SESSION_STORAGE_KEYS } from '../../constants/session-storage-keys';
import useYouthApplicationsListQuery from '../../hooks/backend/useYouthApplicationsListQuery';
import useSessionStorageState from '../../hooks/useSessionStorageState';
import {
  APPLICATION_LIST_TYPES,
  PaginatedResponse,
  YouthApplication,
} from '../../types/application';
import { getAssigneeName } from '../../utils/assignee.utils';
import ActionCell from './ActionCell';
import ApplicationListTable, {
  DEFAULT_ORDERING,
  HdsHeader,
  OrderingField,
  TableState,
  useApplicationTableQuery,
} from './ApplicationListTable';
import { $FilterLabel, $FilterWrapper } from './searchFilters/FilterSection';
import StatusFilter from './searchFilters/StatusFilter';

const ASSIGNEE_TRANSLATION_KEY = 'common:application.assignee';
const ASSIGNEE_TOOLTIP_TRANSLATION_KEY = 'common:application.assigneeTooltip';

const $TabList = styled(TabList)`
  margin-bottom: 1rem;
`;

const $PassiveText = styled.span`
  font-family: Arial, Helvetica, sans-serif;
  font-style: italic;

  &::before {
    content: '(';
  }

  &::after {
    content: ')';
  }
`;

/**
 * All possible statuses that fall under the "pending" category for youth applications.
 * Used to define the available options in the pending status search filter component.
 */
const YOUTH_PENDING_STATUSES = [
  YouthApplicationStatus.SUBMITTED,
  YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
  YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
  YouthApplicationStatus.APPLICATION_HANDLING,
];

/**
 * The initial and default statuses selected for the pending youth applications list query.
 * Also used as default/fallback statuses when no specific filters are checked by the user.
 */
const DEFAULT_PENDING_STATUSES = [
  YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
  YouthApplicationStatus.APPLICATION_HANDLING,
];

/**
 * All statuses considered "processed" for youth applications
 */
const PROCESSED_STATUSES = [
  YouthApplicationStatus.ACCEPTED,
  YouthApplicationStatus.REJECTED,
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
            value={
              row.social_security_number || (
                <$PassiveText>{t('common:applicationList.noSsn')}</$PassiveText>
              )
            }
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
          t(`common:applicationList.youth.status.${String(row.status)}`),
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
      {
        key: 'assignee',
        headerName: t(ASSIGNEE_TRANSLATION_KEY),
        isSortable: false,
        transform: (row) => getAssigneeName(row.assignee) || '-',
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
    React.SetStateAction<YouthApplicationStatus[]>
  >;
  selectedStatuses: YouthApplicationStatus[];
};

const useYouthApplications = (
  initialStatuses: YouthApplicationStatus[],
  initialAssignedToMe = false
): UseYouthApplicationsResultType & {
  isAssignedToMe: boolean;
  setIsAssignedToMe: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const [selectedStatuses, setSelectedStatuses] =
    useState<YouthApplicationStatus[]>(initialStatuses);
  const [isAssignedToMe, setIsAssignedToMe] = useState(initialAssignedToMe);

  const tableQuery = useApplicationTableQuery<YouthApplication>(
    useYouthApplicationsListQuery,
    selectedStatuses,
    DEFAULT_ORDERING as OrderingField<YouthApplication>,
    isAssignedToMe
  );

  const { setPage } = tableQuery;

  // Reset page when statuses change to avoid showing stale data
  useEffect(() => {
    setPage(0);
  }, [selectedStatuses, isAssignedToMe, setPage]);

  return {
    ...tableQuery,
    setSelectedStatuses,
    selectedStatuses,
    isAssignedToMe,
    setIsAssignedToMe,
  };
};

export default function YouthApplicationList(): React.JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useSessionStorageState(
    SESSION_STORAGE_KEYS.YOUTH_APPLICATIONS_ACTIVE_TAB,
    0
  );

  const {
    page: pendingPage,
    setPage: setPendingPage,
    setOrdering: setPendingOrdering,
    selectedStatuses: selectedPendingStatuses,
    setSelectedStatuses: setSelectedPendingStatuses,
    query: pendingQuery,
    count: pendingCount,
    isAssignedToMe: isPendingAssignedToMe,
    setIsAssignedToMe: setIsPendingAssignedToMe,
  } = useYouthApplications(DEFAULT_PENDING_STATUSES);

  const {
    page: processedPage,
    setPage: setProcessedPage,
    setOrdering: setProcessedOrdering,
    selectedStatuses: selectedProcessedStatuses,
    setSelectedStatuses: setSelectedProcessedStatuses,
    query: processedQuery,
    count: processedCount,
    isAssignedToMe: isProcessedAssignedToMe,
    setIsAssignedToMe: setIsProcessedAssignedToMe,
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
            selectedStatuses={selectedPendingStatuses}
            onChange={setSelectedPendingStatuses}
            listType={APPLICATION_LIST_TYPES.YOUTH}
          />
          <$FilterWrapper>
            <$FilterLabel>
              {t(ASSIGNEE_TRANSLATION_KEY)}
              <Tooltip
                buttonLabel={t('common:application.tooltipShowInfo')}
                tooltipLabel={t(ASSIGNEE_TOOLTIP_TRANSLATION_KEY)}
              >
                {t(ASSIGNEE_TOOLTIP_TRANSLATION_KEY)}
              </Tooltip>
            </$FilterLabel>
            <Checkbox
              id="youth-application-pending-assigned-to-me-filter"
              label={t('common:applicationList.filterAssignedToMe')}
              checked={isPendingAssignedToMe}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setIsPendingAssignedToMe(isChecked);
                if (isChecked) {
                  setSelectedPendingStatuses((prev) => {
                    if (
                      !prev.includes(
                        YouthApplicationStatus.APPLICATION_HANDLING
                      )
                    ) {
                      return [
                        ...prev,
                        YouthApplicationStatus.APPLICATION_HANDLING,
                      ];
                    }
                    return prev;
                  });
                }
              }}
            />
          </$FilterWrapper>
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
            selectedStatuses={selectedProcessedStatuses}
            onChange={setSelectedProcessedStatuses}
            listType={APPLICATION_LIST_TYPES.YOUTH}
          />
          <$FilterWrapper>
            <$FilterLabel>
              {t(ASSIGNEE_TRANSLATION_KEY)}
              <Tooltip
                buttonLabel={t('common:application.tooltipShowInfo')}
                tooltipLabel={t(ASSIGNEE_TOOLTIP_TRANSLATION_KEY)}
              >
                {t(ASSIGNEE_TOOLTIP_TRANSLATION_KEY)}
              </Tooltip>
            </$FilterLabel>
            <Checkbox
              id="youth-application-processed-assigned-to-me-filter"
              label={t('common:applicationList.filterAssignedToMe')}
              checked={isProcessedAssignedToMe}
              onChange={(e) => setIsProcessedAssignedToMe(e.target.checked)}
            />
          </$FilterWrapper>
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
