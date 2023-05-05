import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  IconArrowUndo,
  IconCheckCircleFill,
  IconCrossCircleFill,
  IconDownload,
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
  $TableWrapper,
} from '../table/TableExtras.sc';

type ButtonAhjoStates = 'primary' | 'secondary';

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
  } = batch;

  const applications = React.useMemo(() => apps, [apps]);

  const IS_DRAFT = status === BATCH_STATUSES.DRAFT;
  const [isAtAhjo, setIsAtAhjo] = React.useState<ButtonAhjoStates>('primary');
  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  const { isLoading: isDownloading, mutate: downloadBatchFiles } =
    useDownloadBatchFiles();
  const { mutate: removeApp } = useRemoveAppFromBatch();
  const { mutate: changeBatchStatus } = useBatchStatus();

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading]);

  const markBatchAs = (markBatchAsStatus: BATCH_STATUSES): void =>
    changeBatchStatus({
      id,
      status: markBatchAsStatus,
    });

  const handleBatchStatusChange = (): void => {
    if (isAtAhjo === 'primary') {
      changeBatchStatus({
        id,
        status: BATCH_STATUSES.AWAITING_FOR_DECISION,
      });
      setIsAtAhjo('secondary');
    } else {
      markBatchAs(BATCH_STATUSES.DRAFT);
      setIsAtAhjo('secondary');
    }
  };

  const handleDownloadBatchFiles = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(id);
  };

  const handleAppRemoval = (appId: string): void => {
    const selectedApp = applications.find((app) => app.id === appId);
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
        IS_DRAFT ? (
          <Button
            theme="black"
            variant="supplementary"
            iconLeft={<IconArrowUndo />}
            onClick={() => handleAppRemoval(appId)}
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

  const footerContentDraft = (): JSX.Element => (
    <>
      <Button
        theme="black"
        variant="secondary"
        iconLeft={<IconDownload />}
        isLoading={isDownloadingAttachments}
        disabled={isDownloadingAttachments}
        loadingText={t('common:utility.loading')}
        onClick={() => handleDownloadBatchFiles()}
      >
        {t('common:batches.actions.downloadFiles')}
      </Button>
      <Button
        theme="coat"
        style={{ marginLeft: 'var(--spacing-s)' }}
        variant={isAtAhjo}
        iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
        disabled={status === BATCH_STATUSES.AWAITING_FOR_DECISION}
        className="table-custom-action"
        onClick={() => handleBatchStatusChange()}
      >
        {isAtAhjo === 'primary'
          ? t('common:batches.actions.markAsRegisteredToAhjo')
          : t('common:batches.actions.markedAsRegisteredToAhjo')}
      </Button>
    </>
  );

  const footerContentAhjo = (): JSX.Element => (
    <>
      <Button
        theme="coat"
        variant="primary"
        onClick={() => markBatchAs(BATCH_STATUSES.SENT_TO_TALPA)}
      >
        {t('common:batches.actions.markToPaymentAndArchive')}
      </Button>
      <Button
        theme="black"
        variant="supplementary"
        iconLeft={<IconArrowUndo />}
        onClick={() => markBatchAs(BATCH_STATUSES.DRAFT)}
      >
        {t('common:batches.actions.markAsWaitingForAhjo')}
      </Button>
    </>
  );

  return (
    <$TableWrapper>
      <$HorizontalList>
        <div>
          <dt>{t('common:batches.single')}</dt>
          <dd>{proposalForDecisionHeader()}</dd>
        </div>
        <div>
          <dt>{t('common:batches.list.columns.createdAt')}</dt>
          <dd>{convertToUIDateAndTimeFormat(created_at)}</dd>
        </div>
      </$HorizontalList>
      {applications?.length ? (
        <$TableBody>
          <Table
            indexKey="id"
            theme={theme.components.table}
            rows={applications}
            initialSortingColumnKey="application_number"
            initialSortingOrder="asc"
            cols={cols}
          />
          <$TableFooter>
            {IS_DRAFT ? footerContentDraft() : footerContentAhjo()}
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
