import { ROUTES } from 'benefit/handler/constants';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BatchTableColumns,
  BatchTableTransforms,
} from 'benefit/handler/types/batchList';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
  TALPA_STATUSES,
} from 'benefit-shared/constants';
import {
  ApplicationInBatch,
  BatchProposal,
} from 'benefit-shared/types/application';
import {
  Button,
  IconAlertCircle,
  IconAngleDown,
  IconAngleUp,
  IconArrowUndo,
  IconCheck,
  IconCheckCircle,
  IconCheckCircleFill,
  IconClock,
  IconCrossCircleFill,
  Table,
} from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import { $Link } from 'shared/components/table/Table.sc';
import theme from 'shared/styles/theme';
import {
  convertToUIDateAndTimeFormat,
  sortFinnishDate,
} from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';
import styled from 'styled-components';

import { $Empty } from '../applicationList/ApplicationList.sc';
import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';
import {
  $HorizontalList,
  $TableBody,
  $TableFooter,
  $TableGrid,
  $TableWrapper,
} from '../table/TableExtras.sc';
import BatchFooterCompletion from './batchFooter/BatchFooterCompletion';
import BatchFooterDraft from './batchFooter/BatchFooterDraft';
import BatchFooterInspection from './batchFooter/BatchFooterInspection';

type BatchProps = {
  batch: BatchProposal;
};

const $BatchStatusValue = styled.span`
  margin-left: 6px;
  margin-top: 4px;
`;

// eslint-disable-next-line sonarjs/cognitive-complexity
const BatchApplicationList: React.FC<BatchProps> = ({ batch }: BatchProps) => {
  const { t } = useTranslation();
  const {
    id: batchId,
    status,
    created_at,
    applications: apps,
    proposal_for_decision: proposalForDecision,
    handler,
  } = batch;

  const applications = React.useMemo(() => apps, [apps]);

  const IS_WAITING_FOR_INSPECTION = [
    BATCH_STATUSES.DRAFT,
    BATCH_STATUSES.AHJO_REPORT_CREATED,
  ].includes(status);

  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(
    !IS_WAITING_FOR_INSPECTION
  );
  const [isConfirmAppRemoval, setIsConfirmAppRemoval] = React.useState(false);
  const [appToRemove, setAppToRemove] =
    React.useState<ApplicationInBatch | null>(null);
  const [batchCloseAnimation, setBatchCloseAnimation] = React.useState(false);

  const { mutate: removeApp } = useRemoveAppFromBatch(setBatchCloseAnimation);
  const openAppRemovalDialog = (appId: string): void => {
    const selectedApp = apps.find((app) => app.id === appId);
    setAppToRemove(selectedApp);
    setIsConfirmAppRemoval(true);
  };

  const onAppRemovalSubmit = (): void => {
    removeApp({ appIds: [appToRemove.id], batchId });
    setIsConfirmAppRemoval(false);
    setAppToRemove(null);
  };

  const cols: BatchTableColumns[] = [
    {
      headerName: t('common:applications.list.columns.companyName'),
      key: 'company_name',
      isSortable: true,
      transform: ({ id, company_name: companyName }: BatchTableTransforms) => (
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        <$Link href={`${ROUTES.APPLICATION}?id=${id}`} target="_blank">
          {companyName}
        </$Link>
      ),
    },
    {
      headerName: t('common:applications.list.columns.companyId'),
      key: 'business_id',
      isSortable: true,
    },
    {
      headerName: t('common:applications.list.columns.applicationNum'),
      key: 'application_number',
      isSortable: true,
    },
    {
      headerName: t(
        `common:applications.list.columns.employeeNameArchive`
      )?.toString(),
      key: 'employee_name',
      isSortable: true,
    },
    {
      headerName: t('common:applications.list.columns.handledAt'),
      key: 'handled_at',
      isSortable: true,
      customSortCompareFunction: sortFinnishDate,
    },
  ];

  if (proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED) {
    cols.push({
      headerName: t('common:applications.list.columns.benefitAmount'),
      key: 'total_amount',
      isSortable: true,
      transform: ({ benefitAmount: amount }: { benefitAmount: number }) =>
        formatFloatToCurrency(amount, 'EUR', 'fi-FI', 0),
    });
  }

  if (IS_WAITING_FOR_INSPECTION) {
    cols.push({
      headerName: '',
      key: 'remove',
      transform: ({ id }: { id: string }) =>
        IS_WAITING_FOR_INSPECTION ? (
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconArrowUndo />}
            onClick={() => openAppRemovalDialog(id)}
            disabled={status !== BATCH_STATUSES.DRAFT}
          >
            {' '}
          </Button>
        ) : null,
    });
  }
  if (status === BATCH_STATUSES.REJECTED_BY_TALPA) {
    cols.push({
      headerName: '',
      key: 'talpa_status',
      transform: ({ talpa_status }: BatchTableTransforms) => (
        <>
          {talpa_status === TALPA_STATUSES.NOT_SENT_TO_TALPA && (
            <IconClock color="var(--color-metro)" />
          )}
          {talpa_status === TALPA_STATUSES.REJECTED_BY_TALPA && (
            <IconAlertCircle color="var(--color-alert-dark)" />
          )}
          {talpa_status === TALPA_STATUSES.SUCCESFULLY_SENT_TO_TALPA && (
            <IconCheck color="var(--color-tram)" />
          )}
        </>
      ),
    });
  }

  const proposalForDecisionHeader = (): JSX.Element => {
    if (proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED) {
      return (
        <>
          <IconCheckCircleFill color="var(--color-tram)" />
          <$BatchStatusValue>
            {`${t('common:batches.list.columns.statuses.accepted')} (${
              applications?.length
            })`}
          </$BatchStatusValue>
        </>
      );
    }
    return (
      <>
        <IconCrossCircleFill color="var(--color-brick)" />
        <$BatchStatusValue>
          {`${t('common:batches.list.columns.statuses.rejected')} (${
            applications?.length
          })`}
        </$BatchStatusValue>
      </>
    );
  };

  return (
    <$TableGrid animateClose={batchCloseAnimation}>
      <$TableWrapper
        borderColor={
          !isCollapsed &&
          [
            BATCH_STATUSES.AWAITING_FOR_DECISION,
            BATCH_STATUSES.DECIDED_ACCEPTED,
          ].includes(status)
            ? theme.colors.fogDark
            : null
        }
      >
        <Modal
          id={`batch-confirmation-modal-app-removal-${batchId}`}
          isOpen={isConfirmAppRemoval}
          submitButtonLabel=""
          cancelButtonLabel=""
          handleSubmit={noop}
          handleToggle={noop}
          variant="primary"
          customContent={
            isConfirmAppRemoval ? (
              <ConfirmModalContent
                variant="primary"
                heading={t('common:batches.dialog.removeApplication.heading')}
                text={t('common:batches.dialog.removeApplication.text', {
                  applicationNumber: `${appToRemove.company_name} / ${appToRemove.employee_name} (${appToRemove.application_number})`,
                })}
                onClose={() => setIsConfirmAppRemoval(false)}
                onSubmit={onAppRemovalSubmit}
              />
            ) : null
          }
        />
        <$HorizontalList>
          <div>
            <dt>{t('common:batches.single')}</dt>
            <dd>{proposalForDecisionHeader()}</dd>
          </div>
          <div>
            <dt>{t('common:batches.list.columns.handler')}</dt>
            <dd>{handler?.first_name}</dd>
          </div>
          <div>
            <dt>{t('common:batches.list.columns.createdAt')}</dt>
            <dd>{convertToUIDateAndTimeFormat(created_at)}</dd>
          </div>
          {[
            BATCH_STATUSES.SENT_TO_TALPA,
            BATCH_STATUSES.DECIDED_ACCEPTED,
            BATCH_STATUSES.REJECTED_BY_TALPA,
          ].includes(status) && (
            <div>
              <dt>{t('common:batches.list.columns.status')}</dt>
              <dd>
                {status === BATCH_STATUSES.DECIDED_ACCEPTED && (
                  <IconClock color="var(--color-info)" />
                )}
                {status === BATCH_STATUSES.SENT_TO_TALPA && (
                  <IconCheckCircle color="var(--color-tram)" />
                )}
                {status === BATCH_STATUSES.REJECTED_BY_TALPA && (
                  <IconAlertCircle color="var(--color-alert-dark)" />
                )}
                <$BatchStatusValue>
                  {status === BATCH_STATUSES.DECIDED_ACCEPTED &&
                    t('common:batches.list.columns.statuses.waitingForPayment')}
                  {status === BATCH_STATUSES.REJECTED_BY_TALPA &&
                    t('common:batches.list.columns.statuses.issueInTalpa')}
                  {status === BATCH_STATUSES.SENT_TO_TALPA &&
                    t('common:batches.list.columns.statuses.inPayment')}
                </$BatchStatusValue>
              </dd>
            </div>
          )}
          <div>
            {applications.length > 0 ? (
              <button
                type="button"
                data-testid="toggle-batch-applications"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <IconAngleDown /> : <IconAngleUp />}
              </button>
            ) : null}
          </div>
        </$HorizontalList>

        {applications?.length ? (
          <$TableBody $isCollapsed={isCollapsed} aria-hidden={isCollapsed}>
            <Table
              indexKey="id"
              theme={theme.components.table}
              rows={applications}
              initialSortingColumnKey="application_number"
              initialSortingOrder="asc"
              cols={cols}
            />
            <$TableFooter
              backgroundColor={
                [
                  BATCH_STATUSES.AWAITING_FOR_DECISION,
                  BATCH_STATUSES.DECIDED_ACCEPTED,
                ].includes(status)
                  ? theme.colors.coatOfArmsLight
                  : theme.colors.infoLight
              }
            >
              {IS_WAITING_FOR_INSPECTION && (
                <BatchFooterDraft
                  batch={batch}
                  setBatchCloseAnimation={setBatchCloseAnimation}
                />
              )}

              {[BATCH_STATUSES.AWAITING_FOR_DECISION].includes(status) && (
                <BatchFooterInspection
                  batch={batch}
                  setBatchCloseAnimation={setBatchCloseAnimation}
                />
              )}
              {[
                BATCH_STATUSES.DECIDED_ACCEPTED,
                BATCH_STATUSES.SENT_TO_TALPA,
                BATCH_STATUSES.REJECTED_BY_TALPA,
              ].includes(status) && (
                <BatchFooterCompletion
                  batch={batch}
                  setBatchCloseAnimation={setBatchCloseAnimation}
                />
              )}
            </$TableFooter>
          </$TableBody>
        ) : (
          <$Empty css="margin: var(--spacing-s) 0;">
            {t('common:batches.list.empty')}
          </$Empty>
        )}
      </$TableWrapper>
    </$TableGrid>
  );
};

export default BatchApplicationList;
