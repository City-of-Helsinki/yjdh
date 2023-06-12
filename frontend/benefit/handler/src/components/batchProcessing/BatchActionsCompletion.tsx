import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import { getErrorText } from 'benefit/handler/utils/forms';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import { Button, DateInput, IconArrowUndo, TextInput } from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';

import ConfirmModalContent from '../applicationReview/actions/ConfirmModalContent/confirm';
import { $FormSection } from '../table/TableExtras.sc';
import { useBatchActionsCompletion } from './useBatchActionsCompletion';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

const BatchActionsCompletion: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: BatchProps) => {
  const { id, proposal_for_decision: proposalForDecision } = batch;
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const { formik, yearFromNow, isSuccess, isError } = useBatchActionsCompletion(
    id,
    proposalForDecision,
    setBatchCloseAnimation
  );

  const { mutate: changeBatchStatus } = useBatchStatus(setBatchCloseAnimation);
  const [isModalBatchToDraft, setModalBatchToDraft] = React.useState(false);
  const [isModalBatchToTalpa, setModalBatchToTalpa] = React.useState(false);

  const handleModalClose = (): void => {
    setModalBatchToDraft(false);
    setModalBatchToTalpa(false);
    setIsSubmitted(false);
  };

  const handleBatchStatusChange = (): void => {
    changeBatchStatus({ id, status: BATCH_STATUSES.DRAFT });
    setModalBatchToDraft(false);
  };

  useEffect(() => {
    if (isSuccess || isError) {
      setIsSubmitted(false);
    }
  }, [isSuccess, isError]);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, true);

  const handleBatchToTalpa = async (): Promise<boolean> =>
    formik
      .submitForm()
      .then(() => {
        setModalBatchToTalpa(false);
        setIsSubmitted(true);
        return true;
      })
      .catch(() => {
        setModalBatchToTalpa(false);
        setIsSubmitted(false);
        return false;
      });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    formik
      .validateForm()
      .then((errors) => {
        if (Object.keys(errors).length > 0) {
          return null;
        }
        setIsSubmitted(true);
        setModalBatchToTalpa(true);
        return true;
      })
      .catch(() => {
        setModalBatchToTalpa(false);
        setIsSubmitted(false);
      });
  };

  return (
    <>
      <Modal
        id={`batch-confirmation-modal-${id}`}
        isOpen={isModalBatchToDraft || isModalBatchToTalpa}
        submitButtonLabel=""
        cancelButtonLabel=""
        handleSubmit={noop}
        handleToggle={noop}
        variant="primary"
        customContent={
          <>
            {isModalBatchToDraft ? (
              <ConfirmModalContent
                variant="primary"
                heading={t(
                  'common:batches.dialog.batchFromAhjoToDraft.heading'
                )}
                text={t('common:batches.dialog.batchFromAhjoToDraft.text')}
                onClose={handleModalClose}
                onSubmit={handleBatchStatusChange}
              />
            ) : null}
            {isModalBatchToTalpa ? (
              <ConfirmModalContent
                variant="primary"
                heading={t(
                  'common:batches.dialog.batchFromAhjoToTalpa.heading'
                )}
                text={t('common:batches.dialog.batchFromAhjoToTalpa.text')}
                onClose={handleModalClose}
                onSubmit={() => void handleBatchToTalpa()}
              />
            ) : null}
          </>
        }
      />
      <form onSubmit={handleSubmit} noValidate>
        <$FormSection>
          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={t('common:batches.form.fields.decisionMakerName')}
              id={`decision_maker_name_${id}`}
              name="decision_maker_name"
              errorText={getErrorMessage('decision_maker_name')}
              invalid={!!formik.errors.decision_maker_name}
              value={formik.values.decision_maker_name ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={t('common:batches.form.fields.decisionMakerTitle')}
              id={`decision_maker_title${id}`}
              name="decision_maker_title"
              errorText={getErrorMessage('decision_maker_title')}
              invalid={!!formik.errors.decision_maker_title}
              value={formik.values.decision_maker_title ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={2}>
            <TextInput
              onChange={formik.handleChange}
              label={t('common:batches.form.fields.sectionOfTheLaw')}
              id={`section_of_the_law${id}`}
              name="section_of_the_law"
              errorText={getErrorMessage('section_of_the_law')}
              invalid={!!formik.errors.section_of_the_law}
              value={formik.values.section_of_the_law ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <DateInput
              minDate={yearFromNow}
              onChange={(value) => formik.setFieldValue('decision_date', value)}
              label={t('common:batches.form.fields.decisionDate')}
              id={`decision_date${id}`}
              name="decision_date"
              errorText={getErrorMessage('decision_date')}
              disableConfirmation
              invalid={!!formik.errors.decision_date}
              value={String(formik.values.decision_date)}
              language="fi"
              required
            />
          </$GridCell>
        </$FormSection>

        <$FormSection>
          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={t('common:batches.form.fields.expertInspectorName')}
              id={`expert_inspector_name${id}`}
              name="expert_inspector_name"
              errorText={getErrorMessage('expert_inspector_name')}
              invalid={!!formik.errors.expert_inspector_name}
              value={formik.values.expert_inspector_name ?? ''}
              required
            />
          </$GridCell>

          <$GridCell $colSpan={3}>
            <TextInput
              onChange={formik.handleChange}
              label={t('common:batches.form.fields.expertInspectorTitle')}
              id={`expert_inspector_title_${id}`}
              name="expert_inspector_title"
              errorText={getErrorMessage('expert_inspector_title')}
              invalid={!!formik.errors.expert_inspector_title}
              value={formik.values.expert_inspector_title ?? ''}
              required
            />
          </$GridCell>
        </$FormSection>

        <$FormSection>
          <$GridCell $colSpan={3}>
            <Button
              disabled={isSubmitted}
              type="submit"
              theme="coat"
              variant="primary"
              css="min-width: 284px;"
            >
              {proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
                ? t('common:batches.actions.markToPaymentAndArchive')
                : t('common:batches.actions.markToArchive')}
            </Button>
          </$GridCell>
          <$GridCell $colSpan={4} alignSelf="end">
            <Button
              theme="black"
              variant="supplementary"
              iconLeft={<IconArrowUndo />}
              onClick={() => setModalBatchToDraft(true)}
            >
              {t('common:batches.actions.markAsWaitingForAhjo')}
            </Button>
          </$GridCell>
        </$FormSection>
      </form>
    </>
  );
};

export default BatchActionsCompletion;
