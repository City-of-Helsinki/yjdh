import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadBatchFiles from 'benefit/handler/hooks/useDownloadBatchFiles';
import useRemoveAppFromBatch from 'benefit/handler/hooks/useRemoveAppFromBatch';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  DialogVariant,
  IconCheckCircleFill,
  IconCross,
  IconDownload,
  ToggleButton,
  Tooltip,
} from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import { useTheme } from 'styled-components';

import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';
import { $TooltipWrapper } from './batchAction/BatchActions.sc';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

type ButtonAhjoStates = 'primary' | 'secondary';

const BatchActionsDraft: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: BatchProps) => {
  const { id, status, applications, handler } = batch;
  const { t } = useTranslation();
  const { mutate: changeBatchStatus } = useBatchStatus(setBatchCloseAnimation);

  const {
    isError: isDownloadError,
    isLoading: isDownloading,
    mutate: downloadBatchFiles,
  } = useDownloadBatchFiles();

  const { mutate: removeApp } = useRemoveAppFromBatch(setBatchCloseAnimation);

  const [isAtAhjo] = React.useState<ButtonAhjoStates>('primary');
  const [isBatchLocked, setIsBatchLocked] = React.useState<boolean>(
    status === BATCH_STATUSES.AHJO_REPORT_CREATED
  );

  const theme = useTheme();

  const [isDownloadingAttachments, setIsDownloadingAttachments] =
    React.useState(false);

  const [isModalBatchRemoval, setModalBatchRemoval] = React.useState(false);
  const [isModalBatchToDraft, setModalBatchToDraft] = React.useState(false);
  const [isModalBatchToAhjo, setModalBatchToAhjo] = React.useState(false);

  const handleModalClose = (): void => {
    setModalBatchRemoval(false);
    setModalBatchToDraft(false);
    setModalBatchToAhjo(false);
  };

  React.useEffect(() => {
    if (!isDownloading) {
      setIsDownloadingAttachments(false);
    }
    if (isDownloadError) {
      setIsDownloadingAttachments(false);
    }
  }, [isDownloading, isDownloadError]);

  const handleDownloadBatchFiles = (): void => {
    setIsDownloadingAttachments(true);
    downloadBatchFiles(id);
  };

  const variantForAction = (): DialogVariant => {
    if (isModalBatchRemoval) {
      return 'danger';
    }
    return 'primary';
  };

  const handleBatchStatusChange = (
    newStatus:
      | BATCH_STATUSES.AWAITING_FOR_DECISION
      | BATCH_STATUSES.AHJO_REPORT_CREATED
      | BATCH_STATUSES.DRAFT
  ): void => {
    changeBatchStatus({
      id,
      status: newStatus,
    });
    if (newStatus === BATCH_STATUSES.DRAFT) {
      setIsBatchLocked(false);
    }
    if (newStatus === BATCH_STATUSES.AHJO_REPORT_CREATED) {
      handleDownloadBatchFiles();
      setIsBatchLocked(true);
    }
    handleModalClose();
  };

  const handleBatchRemoval = (): void => {
    const allApps = applications.map((app) => app.id);
    removeApp({ appIds: allApps, batchId: id });
    setModalBatchRemoval(false);
  };

  return (
    <>
      <Modal
        id={`batch-confirmation-modal-${id}`}
        isOpen={
          isModalBatchRemoval || isModalBatchToDraft || isModalBatchToAhjo
        }
        submitButtonLabel=""
        cancelButtonLabel=""
        handleSubmit={noop}
        handleToggle={noop}
        variant={variantForAction()}
        customContent={
          <>
            {isModalBatchRemoval ? (
              <ConfirmModalContent
                variant={variantForAction()}
                heading={t('common:batches.dialog.batchRemoval.heading')}
                text={t('common:batches.dialog.batchRemoval.text')}
                onClose={handleModalClose}
                onSubmit={handleBatchRemoval}
              />
            ) : null}
            {isModalBatchToDraft ? (
              <ConfirmModalContent
                variant={variantForAction()}
                heading={t('common:batches.dialog.fromLockedToDraft.heading')}
                text={t('common:batches.dialog.fromLockedToDraft.text')}
                onClose={handleModalClose}
                onSubmit={() => handleBatchStatusChange(BATCH_STATUSES.DRAFT)}
              />
            ) : null}
            {isModalBatchToAhjo ? (
              <ConfirmModalContent
                variant={variantForAction()}
                heading={t(
                  'common:batches.dialog.fromDraftToInspection.heading'
                )}
                text={t('common:batches.dialog.fromDraftToInspection.text')}
                onClose={handleModalClose}
                onSubmit={() =>
                  handleBatchStatusChange(BATCH_STATUSES.AWAITING_FOR_DECISION)
                }
              />
            ) : null}
          </>
        }
      />

      {status === BATCH_STATUSES.DRAFT ? (
        <Button
          theme="coat"
          variant={isAtAhjo}
          iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
          className="table-custom-action"
          style={{ minWidth: '222px', marginRight: theme.spacing.s }}
          onClick={() =>
            handleBatchStatusChange(BATCH_STATUSES.AHJO_REPORT_CREATED)
          }
        >
          {t('common:batches.actions.markAsReadyForAhjo')}
        </Button>
      ) : null}

      {status === BATCH_STATUSES.AHJO_REPORT_CREATED ? (
        <Button
          theme="black"
          disabled={isDownloadingAttachments}
          variant="secondary"
          style={{ minWidth: '222px', marginRight: theme.spacing.s }}
          iconLeft={<IconDownload />}
          isLoading={isDownloadingAttachments}
          loadingText={t('common:utility.loading')}
          onClick={() => handleDownloadBatchFiles()}
        >
          {t('common:batches.actions.downloadFiles')}
        </Button>
      ) : null}
      <Button
        theme="coat"
        disabled={isDownloadingAttachments || status === BATCH_STATUSES.DRAFT}
        style={{ marginRight: theme.spacing.s }}
        variant={isAtAhjo}
        iconLeft={isAtAhjo === 'secondary' ? <IconCheckCircleFill /> : null}
        onClick={() => setModalBatchToAhjo(true)}
      >
        {isAtAhjo === 'primary'
          ? t('common:batches.actions.markAsRegisteredToAhjo')
          : t('common:batches.actions.markedAsRegisteredToAhjo')}
      </Button>

      <$TooltipWrapper disabled={status === BATCH_STATUSES.DRAFT}>
        <label htmlFor={`ahjo-lock-${id}`}>
          {t('common:batches.actions.lockedBatch')}
          <span>
            <Tooltip placement="top">
              {t('common:batches.tooltips.lockedBatch', {
                name: handler?.first_name,
              })}
            </Tooltip>
          </span>
          <ToggleButton
            checked={isBatchLocked}
            variant="inline"
            id={`ahjo-lock-${id}`}
            label=""
            disabled={isDownloadingAttachments}
            onChange={() => setModalBatchToDraft(true)}
          />
        </label>
      </$TooltipWrapper>
      <Button
        theme="black"
        disabled={isDownloadingAttachments}
        style={{ marginLeft: 'auto' }}
        variant="secondary"
        iconLeft={<IconCross />}
        onClick={() => setModalBatchRemoval(true)}
      >
        {t('common:batches.actions.deleteBatch')}
      </Button>
    </>
  );
};
export default BatchActionsDraft;
