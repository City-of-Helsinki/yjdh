import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadP2PFile from 'benefit/handler/hooks/useDownloadP2PFile';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, IconArrowUndo, IconDownload } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import { useTheme } from 'styled-components';

import ConfirmModalContent from '../../applicationReview/actions/ConfirmModalContent/confirm';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

const BatchFooterCompletion: React.FC<BatchProps> = ({
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
    mutate: downloadP2PFile,
  } = useDownloadP2PFile();

  const { mutate: changeBatchStatus } = useBatchStatus(setBatchCloseAnimation);
  const [isModalBatchToCompletion, setModalBatchToCompletion] =
    React.useState(false);
  const [isModalBatchToInspection, setModalBatchToInspection] =
    React.useState(false);

  const handleModalClose = (): void => {
    setModalBatchToCompletion(false);
    setModalBatchToInspection(false);
  };

  const handleBatchStatusChange = (status: BATCH_STATUSES): void => {
    changeBatchStatus({ id, status });
    handleModalClose();
  };

  const handleDownloadP2PFile = React.useCallback(() => {
    setIsDownloadingAttachments(true);
    downloadP2PFile(id);
  }, [downloadP2PFile, id]);

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
    if (isDownloadError) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading, isDownloadError]);

  return (
    <>
      {isModalBatchToCompletion && (
        <Modal
          id={`batch-confirmation-modal-${id}`}
          isOpen={isModalBatchToCompletion}
          submitButtonLabel=""
          cancelButtonLabel=""
          handleSubmit={noop}
          handleToggle={noop}
          variant="primary"
          customContent={
            isModalBatchToCompletion ? (
              <ConfirmModalContent
                variant="primary"
                heading={t(
                  'common:batches.dialog.fromInspectionToArchive.heading'
                )}
                text={t('common:batches.dialog.fromInspectionToArchive.text')}
                onClose={handleModalClose}
                onSubmit={() =>
                  handleBatchStatusChange(BATCH_STATUSES.SENT_TO_TALPA)
                }
              />
            ) : null
          }
        />
      )}
      {isModalBatchToCompletion && (
        <Modal
          id={`batch-confirmation-modal-${id}`}
          isOpen={isModalBatchToCompletion}
          submitButtonLabel=""
          cancelButtonLabel=""
          handleSubmit={noop}
          handleToggle={noop}
          variant="primary"
          customContent={
            isModalBatchToCompletion ? (
              <ConfirmModalContent
                variant="primary"
                heading={t(
                  'common:batches.dialog.fromCompletionToArchive.heading'
                )}
                text={t('common:batches.dialog.fromCompletionToArchive.text')}
                onClose={handleModalClose}
                onSubmit={() =>
                  handleBatchStatusChange(BATCH_STATUSES.SENT_TO_TALPA)
                }
              />
            ) : null
          }
        />
      )}
      {isModalBatchToInspection && (
        <Modal
          id={`batch-confirmation-modal-${id}`}
          isOpen={isModalBatchToInspection}
          submitButtonLabel=""
          cancelButtonLabel=""
          handleSubmit={noop}
          handleToggle={noop}
          variant="primary"
          customContent={
            isModalBatchToInspection ? (
              <ConfirmModalContent
                variant="primary"
                heading={t(
                  'common:batches.dialog.fromCompletionToInspection.heading'
                )}
                text={t(
                  'common:batches.dialog.fromCompletionToInspection.text'
                )}
                onClose={handleModalClose}
                onSubmit={() =>
                  handleBatchStatusChange(BATCH_STATUSES.AWAITING_FOR_DECISION)
                }
              />
            ) : null
          }
        />
      )}
      <Button
        theme="black"
        disabled={isDownloadingAttachments}
        variant="secondary"
        style={{ marginRight: theme.spacing.s }}
        iconLeft={<IconDownload />}
        isLoading={isDownloadingAttachments}
        loadingText={t('common:utility.loading')}
        onClick={() => handleDownloadP2PFile()}
      >
        {t('common:batches.actions.downloadP2PFile')}
      </Button>
      <Button
        theme="coat"
        variant="primary"
        disabled={isDownloadingAttachments}
        style={{ marginRight: theme.spacing.s }}
        onClick={() => setModalBatchToCompletion(true)}
      >
        {t('common:batches.actions.markToArchive')}
      </Button>
      <Button
        theme="black"
        variant="supplementary"
        iconLeft={<IconArrowUndo />}
        onClick={() => setModalBatchToInspection(true)}
      >
        {t('common:batches.actions.returnToInspection')}
      </Button>
    </>
  );
};

export default BatchFooterCompletion;
