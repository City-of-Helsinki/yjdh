import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  IconCheckCircleFill,
  IconCross,
  IconDownload,
  ToggleButton,
  Tooltip,
} from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';

type BatchProps = {
  batch: BatchProposal;
};

type ButtonAhjoStates = 'primary' | 'secondary';

const BatchActionsCompletion: React.FC<BatchProps> = ({
  batch,
}: BatchProps) => {
  const { t } = useTranslation();
  const { mutate: changeBatchStatus } = useBatchStatus();

  const {
    isError: isDownloadError,
    isLoading: isDownloading,
    mutate: downloadBatchFiles,
  } = useDownloadBatchFiles();

  const { mutate: removeApp } = useRemoveAppFromBatch();

  const [isAtAhjo] = React.useState<ButtonAhjoStates>('primary');
  const [isBatchLocked, setIsBatchLocked] = React.useState<boolean>(
    batch.status === BATCH_STATUSES.AHJO_REPORT_CREATED
  );

  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
    if (isDownloadError) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading]);

  const handleDownloadBatchFiles = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(batch.id);
  };

  const handleBatchStatusChange = (
    status:
      | BATCH_STATUSES.AWAITING_FOR_DECISION
      | BATCH_STATUSES.AHJO_REPORT_CREATED
      | BATCH_STATUSES.DRAFT
  ): void => {
    changeBatchStatus({
      id: batch.id,
      status,
    });
    if (status === BATCH_STATUSES.DRAFT) {
      setIsBatchLocked(false);
    }
    if (status === BATCH_STATUSES.AHJO_REPORT_CREATED) {
      handleDownloadBatchFiles();
      setIsBatchLocked(true);
    }
  };

  const handleBatchRemoval = (): void => {
    const allApps = batch.applications.map((app) => app.id);
    // eslint-disable-next-line no-alert
    if (window.confirm(`Oletko varma, että haluat tyhjentää koonnin?`))
      removeApp({ appIds: allApps, batchId: batch.id });
  };

  return (
    <>
      {batch.status === BATCH_STATUSES.DRAFT ? (
        <Button
          theme="coat"
          variant={isAtAhjo}
          iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
          className="table-custom-action"
          onClick={() =>
            handleBatchStatusChange(BATCH_STATUSES.AHJO_REPORT_CREATED)
          }
        >
          {t('common:batches.actions.markAsReadyForAhjo')}
        </Button>
      ) : null}

      {batch.status === BATCH_STATUSES.AHJO_REPORT_CREATED ? (
        <>
          <Button
            theme="black"
            disabled={isDownloadingAttachments}
            variant="secondary"
            style={{ minWidth: '180px' }}
            iconLeft={<IconDownload />}
            isLoading={isDownloadingAttachments}
            loadingText={t('common:utility.loading')}
            onClick={() => handleDownloadBatchFiles()}
          >
            {t('common:batches.actions.downloadFiles')}
          </Button>
          <Button
            theme="coat"
            disabled={isDownloadingAttachments}
            style={{ marginLeft: 'var(--spacing-s)' }}
            variant={isAtAhjo}
            iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
            onClick={() =>
              handleBatchStatusChange(BATCH_STATUSES.AWAITING_FOR_DECISION)
            }
          >
            {isAtAhjo === 'primary'
              ? t('common:batches.actions.markAsRegisteredToAhjo')
              : t('common:batches.actions.markedAsRegisteredToAhjo')}
          </Button>
          <div style={{ marginLeft: 'var(--spacing-l)' }}>
            <label
              htmlFor={`ahjo-lock-${batch.id}`}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              {t('common:batches.actions.lockedBatch')}
              <span style={{ marginRight: 'var(--spacing-s)' }}>
                <Tooltip placement="top">
                  {t('common:batches.tooltips.lockedBatch', {
                    name: batch.handler?.first_name,
                  })}
                </Tooltip>
              </span>
              <ToggleButton
                checked={isBatchLocked}
                variant="inline"
                id={`ahjo-lock-${batch.id}`}
                label=""
                disabled={isDownloadingAttachments}
                onChange={() => handleBatchStatusChange(BATCH_STATUSES.DRAFT)}
              />
            </label>
          </div>
        </>
      ) : null}
      <Button
        theme="coat"
        disabled={isDownloadingAttachments}
        style={{ marginLeft: 'auto' }}
        variant="secondary"
        iconLeft={<IconCross />}
        onClick={() => handleBatchRemoval()}
      >
        {t('common:batches.actions.deleteBatch')}
      </Button>
    </>
  );
};
export default BatchActionsCompletion;
