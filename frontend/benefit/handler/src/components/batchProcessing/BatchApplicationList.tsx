import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  IconAngleDown,
  IconAngleUp,
  IconArrowUndo,
  IconCheckCircleFill,
  IconCrossCircleFill,
  Table,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import theme from 'shared/styles/theme';
import { convertToUIDateAndTimeFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

import { $Empty } from '../applicationList/ApplicationList.sc';
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
  const [batchCloseAnimation, setBatchCloseAnimation] = React.useState(false);

  const { mutate: removeApp } = useRemoveAppFromBatch();
  const handleAppRemoval = (appId: string): void => {
    const selectedApp = apps.find((app) => app.id === appId);
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        `Ota hakemus ${selectedApp.application_number} pois koonnista?`
      )
    ) {
      removeApp({ appIds: [selectedApp.id], batchId: id });
    }
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
            onClick={() => handleAppRemoval(appId)}
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
    <$TableWrapper>
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
            <button type="button" onClick={() => setIsCollapsed(!isCollapsed)}>
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
              <BatchActionsCompletion batch={batch} />
            ) : (
              <BatchActionsToAhjo batch={batch} />
            )}
          </$TableFooter>
        </$TableBody>
      ) : (
        <$Empty css="margin: var(--spacing-s) 0;">
          {t('common:batches.list.empty')}
        </$Empty>
      )}
    </$TableWrapper>
  );
};

export default BatchApplicationList;
