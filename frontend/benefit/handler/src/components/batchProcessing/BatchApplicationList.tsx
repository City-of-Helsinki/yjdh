import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import {
  ApplicationInBatch,
  BatchProposal,
} from 'benefit-shared/types/application';
import {
  Button,
  IconAngleDown,
  IconAngleUp,
  IconArrowUndo,
  IconCheckCircleFill,
  IconCrossCircleFill,
  Table,
} from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
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
import BatchActionsCompletion from './BatchActionsCompletion';
import BatchActionsToAhjo from './BatchActionsToAhjo';

type BatchProps = {
  batch: BatchProposal;
};

const $BatchStatusValue = styled.span`
  margin-left: 6px;
  margin-top: 4px;
`;

const BatchApplicationList: React.FC<BatchProps> = ({ batch }: BatchProps) => {
  const { t } = useTranslation();
  const {
    id,
    status,
    created_at,
    applications: apps,
    proposal_for_decision: proposalForDecision,
    handler,
  } = batch;

  const applications = React.useMemo(() => apps, [apps]);

  const IS_WAITING_FOR_AHJO = [
    BATCH_STATUSES.DRAFT,
    BATCH_STATUSES.AHJO_REPORT_CREATED,
  ].includes(status);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(
    !IS_WAITING_FOR_AHJO
  );
  const [isConfirmAppRemoval, setConfirmAppRemoval] = React.useState(false);
  const [appToRemove, setAppToRemove] =
    React.useState<ApplicationInBatch | null>(null);
  const [batchCloseAnimation, setBatchCloseAnimation] = React.useState(false);

  const { mutate: removeApp } = useRemoveAppFromBatch(setBatchCloseAnimation);
  const openAppRemovalDialog = (appId: string): void => {
    const selectedApp = apps.find((app) => app.id === appId);
    setAppToRemove(selectedApp);
    setConfirmAppRemoval(true);
  };

  const onAppRemovalSubmit = (): void => {
    removeApp({ appIds: [appToRemove.id], batchId: id });
    setConfirmAppRemoval(false);
    setAppToRemove(null);
  };

  const cols = [
    {
      headerName: t('common:applications.list.columns.companyName'),
      key: 'company_name',
      isSortable: true,
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
    },
    {
      transform: ({ id: appId }: { id: string }) =>
        IS_WAITING_FOR_AHJO ? (
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconArrowUndo />}
            onClick={() => openAppRemovalDialog(appId)}
            disabled={status !== BATCH_STATUSES.DRAFT}
          >
            {' '}
          </Button>
        ) : null,
      headerName: '',
      key: 'remove',
    },
  ];

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
      <$TableWrapper>
        <Modal
          id={`batch-confirmation-modal-app-removal-${id}`}
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
                onClose={() => setConfirmAppRemoval(false)}
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
          <div>
            {applications.length > 0 ? (
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <IconAngleDown /> : <IconAngleUp />}
              </button>
            ) : null}
          </div>
        </$HorizontalList>
        {applications?.length ? (
          <$TableBody isCollapsed={isCollapsed} aria-hidden={isCollapsed}>
            <Table
              indexKey="id"
              theme={theme.components.table}
              rows={applications}
              initialSortingColumnKey="application_number"
              initialSortingOrder="asc"
              cols={cols}
            />
            <$TableFooter>
              {status === BATCH_STATUSES.AWAITING_FOR_DECISION ? (
                <BatchActionsCompletion
                  batch={batch}
                  setBatchCloseAnimation={setBatchCloseAnimation}
                />
              ) : (
                <BatchActionsToAhjo
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
