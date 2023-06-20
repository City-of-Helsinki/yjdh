import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, IconDownload } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import { useTheme } from 'styled-components';

import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

const BatchActionsCompletion: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: BatchProps) => {
  const theme = useTheme();

  const { id } = batch;
  const { t } = useTranslation();
  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  const {
    isError: isDownloadError,
    isLoading: isDownloading,
    mutate: downloadBatchFiles,
  } = useDownloadBatchFiles();

  const { mutate: changeBatchStatus } = useBatchStatus(setBatchCloseAnimation);
  const [isModalBatchToArchive, setModalBatchToArchive] = React.useState(false);

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
    if (isDownloadError) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading, isDownloadError]);

  const handleModalClose = (): void => {
    setModalBatchToArchive(false);
  };

  const handleBatchStatusChange = (): void => {
    changeBatchStatus({ id, status: BATCH_STATUSES.DRAFT });
    setModalBatchToArchive(false);
  };

  const handleDownloadTalpaFile = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(id);
  };

  return (
    <>
      <Modal
        id={`batch-confirmation-modal-${id}`}
        isOpen={isModalBatchToArchive}
        submitButtonLabel=""
        cancelButtonLabel=""
        handleSubmit={noop}
        handleToggle={noop}
        variant="primary"
        customContent={
          isModalBatchToArchive ? (
            <ConfirmModalContent
              variant="primary"
              heading={t('common:batches.dialog.batchFromAhjoToDraft.heading')}
              text={t('common:batches.dialog.batchFromAhjoToDraft.text')}
              onClose={handleModalClose}
              onSubmit={handleBatchStatusChange}
            />
          ) : null
        }
      />
      <Button
        theme="black"
        disabled={isDownloadingAttachments}
        variant="secondary"
        style={{ minWidth: '222px', marginRight: theme.spacing.s }}
        iconLeft={<IconDownload />}
        isLoading={isDownloadingAttachments}
        loadingText={t('common:utility.loading')}
        onClick={() => handleDownloadTalpaFile()}
      >
        {t('common:batches.actions.downloadFiles')}
      </Button>
      <Button
        theme="coat"
        variant="primary"
        disabled={isDownloadingAttachments}
        style={{ marginRight: theme.spacing.s }}
        onClick={() => setModalBatchToArchive(true)}
      >
        {t('common:batches.actions.markToArchive')}
      </Button>
    </>
  );
};

export default BatchActionsCompletion;
