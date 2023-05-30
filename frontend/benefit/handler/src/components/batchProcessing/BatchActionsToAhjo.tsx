import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, IconCheckCircleFill, IconDownload, IconLock } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

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
  const [isAtAhjo] = React.useState<ButtonAhjoStates>('primary');

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
    if (status === BATCH_STATUSES.AHJO_REPORT_CREATED) {
      handleDownloadBatchFiles();
    }
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
            className="table-custom-action"
            onClick={() =>
              handleBatchStatusChange(BATCH_STATUSES.AWAITING_FOR_DECISION)
            }
          >
            {isAtAhjo === 'primary'
              ? t('common:batches.actions.markAsRegisteredToAhjo')
              : t('common:batches.actions.markedAsRegisteredToAhjo')}
          </Button>
          <Button
            theme="coat"
            style={{ marginLeft: 'auto' }}
            iconLeft={<IconLock />}
            disabled={isDownloadingAttachments}
            onClick={() => handleBatchStatusChange(BATCH_STATUSES.DRAFT)}
          >
            Palauta muokattavaksi
          </Button>
        </>
      ) : null}
    </>
  );
};
export default BatchActionsCompletion;
