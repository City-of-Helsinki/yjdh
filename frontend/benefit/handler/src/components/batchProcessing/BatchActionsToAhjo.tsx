import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, IconCheckCircleFill, IconDownload } from 'hds-react';
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

  const { isLoading: isDownloading, mutate: downloadBatchFiles } =
    useDownloadBatchFiles();
  const [isAtAhjo, setIsAtAhjo] = React.useState<ButtonAhjoStates>('primary');

  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading]);

  const handleDownloadBatchFiles = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(batch.id);
  };

  const markBatchAs = (markBatchAsStatus: BATCH_STATUSES): void =>
    changeBatchStatus({
      id: batch.id,
      status: markBatchAsStatus,
    });

  const handleBatchStatusChange = (): void => {
    if (isAtAhjo === 'primary') {
      changeBatchStatus({
        id: batch.id,
        status: BATCH_STATUSES.AWAITING_FOR_DECISION,
      });
      setIsAtAhjo('secondary');
    } else {
      markBatchAs(BATCH_STATUSES.DRAFT);
      setIsAtAhjo('primary');
    }
  };

  return (
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
        className="table-custom-action"
        onClick={() => handleBatchStatusChange()}
      >
        {isAtAhjo === 'primary'
          ? t('common:batches.actions.markAsRegisteredToAhjo')
          : t('common:batches.actions.markedAsRegisteredToAhjo')}
      </Button>
    </>
  );
};
export default BatchActionsCompletion;
