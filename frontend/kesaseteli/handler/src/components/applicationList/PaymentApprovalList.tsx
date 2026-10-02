import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import {
  ButtonPresetTheme,
  ButtonVariant,
  Dialog,
  IconArrowUndo,
  IconCheck,
  IconCross,
  Notification,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from 'hds-react';
import { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import Button from 'shared/components/button/Button';
import styled from 'styled-components';

import { SESSION_STORAGE_KEYS } from '../../constants/session-storage-keys';
import useApproverAcceptForPaymentMutation from '../../hooks/backend/useApproverAcceptForPaymentMutation';
import useApproverRejectMutation from '../../hooks/backend/useApproverRejectMutation';
import useApproverReturnToHandlerMutation from '../../hooks/backend/useApproverReturnToHandlerMutation';
import useApproverReturnToReviewMutation from '../../hooks/backend/useApproverReturnToReviewMutation';
import useEmployerApplicationsListQuery from '../../hooks/backend/useEmployerApplicationsListQuery';
import useSessionStorageState from '../../hooks/useSessionStorageState';
import {
  APPLICATION_LIST_TYPES,
  ApproverBulkActionResult,
  EmployerApplication,
  PaginatedResponse,
} from '../../types/application';
import ApplicationListTable, {
  TableState,
  useApplicationTableQuery,
} from './ApplicationListTable';
import { useEmployerApplicationListColumns } from './EmployerApplicationList';
import StatusFilter from './searchFilters/StatusFilter';
import YearFilter from './searchFilters/YearFilter';

const $TabList = styled(TabList)`
  margin-bottom: var(--spacing-m);
`;

const $PageNotification = styled(Notification)`
  margin-bottom: var(--spacing-m);
`;

const $ActionsContainer = styled.div`
  box-sizing: border-box;
  border: 1px solid var(--color-black-10);
  background-color: var(--color-black-5);
  padding: var(--spacing-m);
  border-radius: 4px;
  margin-top: var(--spacing-m);
  margin-bottom: var(--spacing-m);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-s);
`;

const $ActionsHeading = styled.h4`
  margin: 0;
  font-size: ${(props) => props.theme?.fontSize?.body?.m ?? '1rem'};
  font-weight: 600;
  color: ${(props) => props.theme?.colors?.black90 ?? 'var(--color-black-90)'};
`;

const $ButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-m);
  align-items: center;
`;

const APPROVER_PENDING_STATUSES = [EmployerApplicationStatus.PAYMENT_REVIEW];

const APPROVER_PROCESSED_STATUSES = [
  EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
  EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
  EmployerApplicationStatus.REJECTED,
  EmployerApplicationStatus.CANCELLED,
];

const APPROVER_PAYMENT_ERROR_STATUSES = [
  EmployerApplicationStatus.ERROR_IN_PAYMENT,
];

const BULK_APPROVE_SUBMIT_KEY = 'common:applicationList.bulkApproveSubmit';
const BULK_APPROVE_CONFIRM_KEY = 'common:applicationList.bulkApproveConfirm';
const BULK_REJECT_SUBMIT_KEY = 'common:applicationList.bulkRejectSubmit';
const BULK_REJECT_CONFIRM_KEY = 'common:applicationList.bulkRejectConfirm';
const BULK_RETURN_TO_HANDLER_SUBMIT_KEY =
  'common:applicationList.bulkReturnToHandlerSubmit'; // eslint-disable-line no-secrets/no-secrets
const BULK_RETURN_TO_HANDLER_CONFIRM_KEY =
  'common:applicationList.bulkReturnToHandlerConfirm'; // eslint-disable-line no-secrets/no-secrets
const BULK_RETURN_TO_PAYMENT_REVIEW_SUBMIT_KEY =
  'common:applicationList.bulkReturnToPaymentReviewSubmit'; // eslint-disable-line no-secrets/no-secrets
const BULK_RETURN_TO_PAYMENT_REVIEW_CONFIRM_KEY =
  'common:applicationList.bulkReturnToPaymentReviewConfirm'; // eslint-disable-line no-secrets/no-secrets
const BULK_APPROVE_PAGE_LIMIT_INFO_KEY =
  'common:applicationList.bulkApprovePageLimitInfo'; // eslint-disable-line no-secrets/no-secrets
const FILTER_TITLE_KEY = 'common:applicationList.filterTitle';

type ApproverAction =
  | 'accept'
  | 'reject'
  | 'return_to_handler'
  | 'return_to_review';

type DialogDetails = {
  title: string;
  content: string;
};

type UseEmployerApplicationsResultType = TableState<EmployerApplication> & {
  query: UseQueryResult<PaginatedResponse<EmployerApplication>>;
  count: number;
  setSelectedStatuses: React.Dispatch<
    React.SetStateAction<EmployerApplicationStatus[]>
  >;
  selectedStatuses: EmployerApplicationStatus[];
};

const useEmployerApplications = (
  initialStatuses: EmployerApplicationStatus[],
  selectedYear: number
): UseEmployerApplicationsResultType => {
  const [selectedStatuses, setSelectedStatuses] =
    useState<EmployerApplicationStatus[]>(initialStatuses);

  const tableQuery = useApplicationTableQuery<EmployerApplication>({
    useQueryHook: useEmployerApplicationsListQuery,
    status: selectedStatuses,
    defaultOrdering: '-submitted_at',
    year: selectedYear,
  });

  const { setPage } = tableQuery;

  useEffect(() => {
    setPage(0);
  }, [selectedStatuses, selectedYear, setPage]);

  return {
    ...tableQuery,
    setSelectedStatuses,
    selectedStatuses,
  };
};

/**
 * PaymentApprovalList component providing 3 tabs for the approver role:
 * 1. Pending (Käsiteltävät) - Applications awaiting payment approval
 * 2. Processed (Käsitellyt) - Applications processed by approver or sent to Talpa
 * 3. Payment Errors (Maksuvirheet) - Applications with errors reported by Talpa
 *
 * TODO: Add dedicated test suite for PaymentApprovalList 3-tab layout and actions.
 */
export default function PaymentApprovalList(): React.JSX.Element {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useSessionStorageState(
    SESSION_STORAGE_KEYS.PAYMENT_APPROVAL_ACTIVE_TAB,
    0
  );

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const [pendingSelectedRows, setPendingSelectedRows] = useState<
    (string | number)[]
  >([]);
  const [processedSelectedRows, setProcessedSelectedRows] = useState<
    (string | number)[]
  >([]);
  const [confirmAction, setConfirmAction] = useState<ApproverAction | null>(
    null
  );

  // Tab 0: Pending Review
  const {
    page: pendingPage,
    setPage: setPendingPage,
    setOrdering: setPendingOrdering,
    query: pendingQuery,
    count: pendingCount,
  } = useEmployerApplications(APPROVER_PENDING_STATUSES, selectedYear);

  // Tab 1: Processed
  const {
    page: processedPage,
    setPage: setProcessedPage,
    setOrdering: setProcessedOrdering,
    selectedStatuses: selectedProcessedStatuses,
    setSelectedStatuses: setSelectedProcessedStatuses,
    query: processedQuery,
    count: processedCount,
  } = useEmployerApplications(APPROVER_PROCESSED_STATUSES, selectedYear);

  useEffect(() => {
    setProcessedSelectedRows((prev) => (prev.length > 0 ? [] : prev));
  }, [selectedProcessedStatuses]);

  // Tab 2: Payment Errors
  const {
    page: errorsPage,
    setPage: setErrorsPage,
    setOrdering: setErrorsOrdering,
    query: errorsQuery,
    count: errorsCount,
  } = useEmployerApplications(APPROVER_PAYMENT_ERROR_STATUSES, selectedYear);

  const columns = useEmployerApplicationListColumns();

  const closeConfirmDialog = (): void => {
    setConfirmAction(null);
  };

  const acceptMutation = useApproverAcceptForPaymentMutation({
    onSuccess: () => {
      setPendingSelectedRows([]);
      closeConfirmDialog();
    },
  });

  const rejectMutation = useApproverRejectMutation({
    onSuccess: () => {
      setPendingSelectedRows([]);
      closeConfirmDialog();
    },
  });

  const returnToHandlerMutation = useApproverReturnToHandlerMutation({
    onSuccess: () => {
      setPendingSelectedRows([]);
      closeConfirmDialog();
    },
  });

  const returnToReviewMutation = useApproverReturnToReviewMutation({
    onSuccess: () => {
      setProcessedSelectedRows([]);
      closeConfirmDialog();
    },
  });

  const isAnyActionPending =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    returnToHandlerMutation.isPending ||
    returnToReviewMutation.isPending;

  const getActiveMutation = (): UseMutationResult<
    ApproverBulkActionResult,
    Error,
    string[]
  > | null => {
    switch (confirmAction) {
      case 'accept':
        return acceptMutation;

      case 'reject':
        return rejectMutation;

      case 'return_to_handler':
        return returnToHandlerMutation;

      case 'return_to_review':
        return returnToReviewMutation;

      default:
        return null;
    }
  };

  const getDialogDetails = (): DialogDetails => {
    switch (confirmAction) {
      case 'accept':
        return {
          title: t(BULK_APPROVE_SUBMIT_KEY),
          content: t(BULK_APPROVE_CONFIRM_KEY),
        };

      case 'reject':
        return {
          title: t(BULK_REJECT_SUBMIT_KEY),
          content: t(BULK_REJECT_CONFIRM_KEY),
        };

      case 'return_to_handler':
        return {
          title: t(BULK_RETURN_TO_HANDLER_SUBMIT_KEY),
          content: t(BULK_RETURN_TO_HANDLER_CONFIRM_KEY),
        };

      case 'return_to_review':
        return {
          title: t(BULK_RETURN_TO_PAYMENT_REVIEW_SUBMIT_KEY),
          content: t(BULK_RETURN_TO_PAYMENT_REVIEW_CONFIRM_KEY),
        };

      default:
        return { title: '', content: '' };
    }
  };

  const handleProcessedStatusFilterChange = (
    statuses: EmployerApplicationStatus[]
  ): void => {
    setSelectedProcessedStatuses(statuses);
    setProcessedSelectedRows([]);
  };

  const handleConfirmSubmit = (): void => {
    const mutation = getActiveMutation();
    if (!mutation) {
      return;
    }
    const rowsToSubmit =
      confirmAction === 'return_to_review'
        ? processedSelectedRows
        : pendingSelectedRows;
    mutation.mutate(rowsToSubmit.map(String));
  };

  const dialogDetails = getDialogDetails();
  const activeMutation = getActiveMutation();

  const canReturnProcessedToReview =
    processedSelectedRows.length > 0 &&
    processedSelectedRows.every((rowId) => {
      const row = processedQuery.data?.results?.find(
        (r) => String(r.id) === String(rowId)
      );
      return row?.status === EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT;
    });

  return (
    <>
      <Tabs initiallyActiveTab={activeTab}>
        <$TabList>
          <Tab onClick={() => setActiveTab(0)}>
            {t('common:applicationList.tabs.pending')} ({pendingCount})
          </Tab>
          <Tab onClick={() => setActiveTab(1)}>
            {t('common:applicationList.tabs.processed')} ({processedCount})
          </Tab>
          <Tab onClick={() => setActiveTab(2)}>
            {t('common:applicationList.tabs.paymentErrors')} ({errorsCount})
          </Tab>
        </$TabList>

        {/* Tab 0: Pending Review */}
        <TabPanel>
          <ApplicationListTable.FilterSection
            ariaLabelledBy="payment-approval-pending-filters-heading"
            title={t(FILTER_TITLE_KEY)}
          >
            <YearFilter
              id="payment-approval-pending-year-filter"
              selectedYear={selectedYear}
              onChange={setSelectedYear}
            />
          </ApplicationListTable.FilterSection>

          <$ActionsContainer>
            <$ActionsHeading id="payment-approval-pending-actions-heading">
              {t('common:handlerApplication.actionsTitle')}
            </$ActionsHeading>
            <$ButtonsRow aria-labelledby="payment-approval-pending-actions-heading">
              <Button
                theme={ButtonPresetTheme.Coat}
                iconStart={<IconCheck aria-hidden />}
                onClick={() => setConfirmAction('accept')}
                disabled={
                  pendingSelectedRows.length === 0 || isAnyActionPending
                }
                isLoading={acceptMutation.isPending}
                loadingText={t(BULK_APPROVE_SUBMIT_KEY)}
              >
                {t(BULK_APPROVE_SUBMIT_KEY)}
              </Button>
              <Button
                variant={ButtonVariant.Danger}
                iconStart={<IconCross aria-hidden />}
                onClick={() => setConfirmAction('reject')}
                disabled={
                  pendingSelectedRows.length === 0 || isAnyActionPending
                }
                isLoading={rejectMutation.isPending}
                loadingText={t(BULK_REJECT_SUBMIT_KEY)}
              >
                {t(BULK_REJECT_SUBMIT_KEY)}
              </Button>
              <Button
                variant={ButtonVariant.Supplementary}
                iconStart={<IconArrowUndo aria-hidden />}
                onClick={() => setConfirmAction('return_to_handler')}
                disabled={
                  pendingSelectedRows.length === 0 || isAnyActionPending
                }
                isLoading={returnToHandlerMutation.isPending}
                loadingText={t(BULK_RETURN_TO_HANDLER_SUBMIT_KEY)}
              >
                {t(BULK_RETURN_TO_HANDLER_SUBMIT_KEY)}
              </Button>
            </$ButtonsRow>
          </$ActionsContainer>

          <$PageNotification>
            {t(BULK_APPROVE_PAGE_LIMIT_INFO_KEY)}
          </$PageNotification>

          <ApplicationListTable<EmployerApplication>
            columns={columns}
            data={pendingQuery.data?.results ?? []}
            totalCount={pendingCount}
            page={pendingPage}
            setPage={setPendingPage}
            setOrdering={setPendingOrdering}
            isLoading={pendingQuery.isLoading}
            defaultSortColumnKey="-submitted_at"
            checkboxSelection
            selectedRows={pendingSelectedRows}
            setSelectedRows={setPendingSelectedRows}
            clearSelection={() => setPendingSelectedRows([])}
          />
        </TabPanel>

        {/* Tab 1: Processed */}
        <TabPanel>
          <ApplicationListTable.FilterSection
            ariaLabelledBy="payment-approval-processed-filters-heading"
            title={t(FILTER_TITLE_KEY)}
          >
            <StatusFilter
              id="payment-approval-processed-status-filter"
              statuses={APPROVER_PROCESSED_STATUSES}
              selectedStatuses={selectedProcessedStatuses}
              onChange={handleProcessedStatusFilterChange}
              listType={APPLICATION_LIST_TYPES.EMPLOYER}
            />
            <YearFilter
              id="payment-approval-processed-year-filter"
              selectedYear={selectedYear}
              onChange={setSelectedYear}
            />
          </ApplicationListTable.FilterSection>

          <$ActionsContainer>
            <$ActionsHeading id="payment-approval-processed-actions-heading">
              {t('common:handlerApplication.actionsTitle')}
            </$ActionsHeading>
            <$ButtonsRow aria-labelledby="payment-approval-processed-actions-heading">
              <Button
                variant={ButtonVariant.Supplementary}
                iconStart={<IconArrowUndo aria-hidden />}
                onClick={() => setConfirmAction('return_to_review')}
                disabled={!canReturnProcessedToReview || isAnyActionPending}
                isLoading={returnToReviewMutation.isPending}
                loadingText={t(BULK_RETURN_TO_PAYMENT_REVIEW_SUBMIT_KEY)}
              >
                {t(BULK_RETURN_TO_PAYMENT_REVIEW_SUBMIT_KEY)}
              </Button>
            </$ButtonsRow>
          </$ActionsContainer>

          <$PageNotification>
            {t(BULK_APPROVE_PAGE_LIMIT_INFO_KEY)}
          </$PageNotification>

          <ApplicationListTable<EmployerApplication>
            columns={columns}
            data={processedQuery.data?.results ?? []}
            totalCount={processedCount}
            page={processedPage}
            setPage={setProcessedPage}
            setOrdering={setProcessedOrdering}
            isLoading={processedQuery.isLoading}
            defaultSortColumnKey="-submitted_at"
            checkboxSelection
            selectedRows={processedSelectedRows}
            setSelectedRows={setProcessedSelectedRows}
            clearSelection={() => setProcessedSelectedRows([])}
          />
        </TabPanel>

        {/* Tab 2: Payment Errors */}
        <TabPanel>
          <ApplicationListTable.FilterSection
            ariaLabelledBy="payment-approval-errors-filters-heading"
            title={t(FILTER_TITLE_KEY)}
          >
            <YearFilter
              id="payment-approval-errors-year-filter"
              selectedYear={selectedYear}
              onChange={setSelectedYear}
            />
          </ApplicationListTable.FilterSection>

          <$PageNotification>
            {t('common:applicationList.paymentErrorsInfo')}
          </$PageNotification>

          <ApplicationListTable<EmployerApplication>
            columns={columns}
            data={errorsQuery.data?.results ?? []}
            totalCount={errorsCount}
            page={errorsPage}
            setPage={setErrorsPage}
            setOrdering={setErrorsOrdering}
            isLoading={errorsQuery.isLoading}
            defaultSortColumnKey="-submitted_at"
          />
        </TabPanel>
      </Tabs>

      <Dialog
        id="bulk-action-confirm-dialog"
        aria-labelledby="bulk-action-confirm-dialog-header"
        isOpen={confirmAction !== null}
        close={closeConfirmDialog}
        closeButtonLabelText={t('common:utility.close')}
      >
        <Dialog.Header
          id="bulk-action-confirm-dialog-header"
          title={dialogDetails.title}
        />
        <Dialog.Content>
          <p>{dialogDetails.content}</p>
        </Dialog.Content>
        <Dialog.ActionButtons>
          <Button
            onClick={handleConfirmSubmit}
            isLoading={activeMutation?.isPending ?? false}
            loadingText={t('common:utility.save')}
          >
            {t('common:utility.save')}
          </Button>
          <Button
            variant={ButtonVariant.Secondary}
            onClick={closeConfirmDialog}
          >
            {t('common:utility.cancel')}
          </Button>
        </Dialog.ActionButtons>
      </Dialog>
    </>
  );
}
