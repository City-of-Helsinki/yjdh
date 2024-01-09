import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import useDownloadP2PFile from 'benefit/handler/hooks/useDownloadP2PFile';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, IconArrowUndo, IconDownload } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

import ConfirmModalContent from '../../applicationReview/actions/ConfirmModalContent/confirm';
import {
  $ViewField,
  $ViewFieldBold,
} from '../../applicationForm/ApplicationForm.sc';
import { $FormSection } from '../../table/TableExtras.sc';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

const BatchFooterCompletion: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: BatchProps) => {
  const {
    id,
    status: batchStatus,
    p2p_checker_name,
    p2p_inspector_email,
    p2p_inspector_name,
    decision_maker_name,
    decision_maker_title,
    decision_date,
    expert_inspector_name,
    expert_inspector_title,
    section_of_the_law,
  } = batch;
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
                  handleBatchStatusChange(BATCH_STATUSES.COMPLETED)
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
                  handleBatchStatusChange(BATCH_STATUSES.COMPLETED)
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
      <$FormSection>
        <$GridCell $colSpan={12}>
          <h3>{t('common:batches.form.headings.decisionDetails')}</h3>
        </$GridCell>

        <$GridCell $colSpan={3} $colStart={1}>
          <$ViewFieldBold>
            {t('common:batches.form.fields.decisionMakerName')}
          </$ViewFieldBold>
          <$ViewField>{decision_maker_name}</$ViewField>
        </$GridCell>

        <$GridCell $colSpan={3}>
          <$ViewFieldBold>
            {t('common:batches.form.fields.decisionMakerTitle')}
          </$ViewFieldBold>
          <$ViewField>{decision_maker_title}</$ViewField>
        </$GridCell>

        <$GridCell $colSpan={2}>
          <$ViewFieldBold>
            {t('common:batches.form.fields.sectionOfTheLaw')}
          </$ViewFieldBold>
          <$ViewField>{section_of_the_law}</$ViewField>
        </$GridCell>

        <$GridCell $colSpan={4}>
          <$ViewFieldBold>
            {t('common:batches.form.fields.decisionDate')}
          </$ViewFieldBold>
          <$ViewField>{convertToUIDateFormat(decision_date)}</$ViewField>
        </$GridCell>
      </$FormSection>

      {expert_inspector_name?.length && expert_inspector_title?.length ? (
        <$FormSection css="width: 100%">
          <$GridCell $colSpan={3} $colStart={1}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.expertInspectorName')}
            </$ViewFieldBold>
            <$ViewField>{expert_inspector_name}</$ViewField>
          </$GridCell>

          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.expertInspectorTitle')}
            </$ViewFieldBold>
            <$ViewField>{expert_inspector_title}</$ViewField>
          </$GridCell>

          <$GridCell $colSpan={6}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.p2pCheckerName')}
            </$ViewFieldBold>
            <$ViewField>{p2p_checker_name}</$ViewField>
          </$GridCell>
        </$FormSection>
      ) : (
        <$FormSection>
          <$GridCell $colSpan={3} $colStart={1}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.p2pInspectorName')}
            </$ViewFieldBold>
            <$ViewField>{p2p_inspector_name}</$ViewField>
          </$GridCell>

          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.p2pInspectorEmail')}
            </$ViewFieldBold>
            <$ViewField>{p2p_inspector_email}</$ViewField>
          </$GridCell>

          <$GridCell $colSpan={3}>
            <$ViewFieldBold>
              {t('common:batches.form.fields.p2pCheckerName')}
            </$ViewFieldBold>
            <$ViewField>{p2p_checker_name}</$ViewField>
          </$GridCell>
        </$FormSection>
      )}

      <div style={{ display: 'flex', width: '100%' }}>
        {batchStatus === BATCH_STATUSES.DECIDED_ACCEPTED && (
          <Button
            theme="black"
            variant="secondary"
            iconLeft={<IconArrowUndo />}
            isLoading={isDownloadingAttachments}
            disabled={isDownloadingAttachments}
            onClick={() => setModalBatchToInspection(true)}
          >
            {t('common:batches.actions.returnToInspection')}
          </Button>
        )}

        {batchStatus === BATCH_STATUSES.SENT_TO_TALPA && (
          <Button
            theme="coat"
            variant="primary"
            disabled={isDownloadingAttachments}
            onClick={() => setModalBatchToCompletion(true)}
          >
            {t('common:batches.actions.markToArchive')}
          </Button>
        )}
        <Button
          theme="black"
          disabled={isDownloadingAttachments}
          variant="supplementary"
          style={{ marginLeft: 'auto' }}
          iconLeft={<IconDownload />}
          isLoading={isDownloadingAttachments}
          loadingText={t('common:utility.loading')}
          onClick={() => handleDownloadP2PFile()}
        >
          {t('common:batches.actions.downloadP2PFile')}
        </Button>
      </div>
    </>
  );
};

export default BatchFooterCompletion;
