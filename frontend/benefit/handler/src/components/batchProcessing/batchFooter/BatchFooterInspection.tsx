import useBatchStatus from 'benefit/handler/hooks/useBatchStatus';
import { getErrorText } from 'benefit/handler/utils/forms';
import {
  BATCH_STATUSES,
  PROPOSALS_FOR_DECISION,
} from 'benefit-shared/constants';
import { BatchProposal } from 'benefit-shared/types/application';
import {
  Button,
  DateInput,
  IconArrowUndo,
  RadioButton,
  TextInput,
} from 'hds-react';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import React, { ChangeEvent } from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import theme from 'shared/styles/theme';

import ConfirmModalContent from '../../applicationReview/actions/ConfirmModalContent/confirm';
import { $InspectionTypeContainer } from '../../table/BatchCompletion.sc';
import { $FormSection } from '../../table/TableExtras.sc';
import { useBatchActionsInspected } from '../useBatchActionsInspected';

type BatchProps = {
  batch: BatchProposal;
  setBatchCloseAnimation: React.Dispatch<React.SetStateAction<boolean>>;
};

interface ModalTranslations {
  heading: string;
  text: string;
}

const BatchFooterInspection: React.FC<BatchProps> = ({
  batch,
  setBatchCloseAnimation,
}: // eslint-disable-next-line sonarjs/cognitive-complexity
BatchProps) => {
  const { id, proposal_for_decision: proposalForDecision } = batch;
  const { t } = useTranslation();
  const { formik, yearFromNow } = useBatchActionsInspected(
    batch,
    setBatchCloseAnimation
  );

  const { mutate: changeBatchStatus } = useBatchStatus(setBatchCloseAnimation);
  const [isModalBatchToDraft, setModalBatchToDraft] = React.useState(false);
  const [isModalBatchToCompletion, setModalBatchToCompletion] =
    React.useState(false);

  const [inspectorMode, setInspectorMode] = React.useState('ahjo');

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, true);

  const handleModalClose = (): void => {
    setModalBatchToDraft(false);
    setModalBatchToCompletion(false);
  };

  const handleSubmitToDraft = (): void => {
    changeBatchStatus({
      id,
      status: BATCH_STATUSES.DRAFT,
    });
    setModalBatchToDraft(false);
  };

  const handleBatchToTalpa = async (): Promise<boolean> =>
    formik
      .submitForm()
      .then(() => {
        setModalBatchToCompletion(false);
        return true;
      })
      .catch(() => {
        setModalBatchToCompletion(false);
        return false;
      });

  const handleRadioButton = (event: ChangeEvent<HTMLInputElement>): void => {
    setInspectorMode(event.target.value);
    formik.handleChange(event);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    formik
      .validateForm()
      .then((errors) => {
        if (Object.keys(errors).length > 0) {
          return null;
        }
        setModalBatchToCompletion(true);
        return true;
      })
      .catch(() => {
        setModalBatchToCompletion(false);
      });
  };

  const getModalTranslations = (): ModalTranslations | null => {
    if (proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED) {
      return {
        heading: t('common:batches.dialog.fromInspectionToCompletion.heading'),
        text: t('common:batches.dialog.fromInspectionToCompletion.text'),
      };
    }
    if (proposalForDecision === PROPOSALS_FOR_DECISION.REJECTED) {
      return {
        heading: t('common:batches.dialog.fromCompletionToArchive.heading'),
        text: t('common:batches.dialog.fromCompletionToArchive.text'),
      };
    }
    return null;
  };

  return (
    <>
      <Modal
        id={`batch-confirmation-modal-${id}`}
        isOpen={isModalBatchToDraft || isModalBatchToCompletion}
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
                  'common:batches.dialog.fromInspectionToDraft.heading'
                )}
                text={t('common:batches.dialog.fromInspectionToDraft.text')}
                onClose={handleModalClose}
                onSubmit={handleSubmitToDraft}
              />
            ) : null}
            {isModalBatchToCompletion ? (
              <ConfirmModalContent
                variant="primary"
                heading={getModalTranslations().heading}
                text={getModalTranslations().text}
                onClose={handleModalClose}
                onSubmit={() => void handleBatchToTalpa()}
              />
            ) : null}
          </>
        }
      />
      <form onSubmit={handleSubmit} noValidate>
        <h3>{t('common:batches.form.headings.decisionDetails')}</h3>
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

        {proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED ? (
          <>
            <h3>{t('common:batches.form.headings.inspectionDetails')}</h3>
            <$InspectionTypeContainer>
              <$FormSection>
                <$GridCell $colSpan={12}>
                  <RadioButton
                    key={`inspector-mode-${id}-ahjo`}
                    id={`inspector-mode-${id}-ahjo`}
                    value="ahjo"
                    label="Ahjo-tarkastus"
                    name="inspection_mode"
                    checked={inspectorMode === 'ahjo'}
                    onChange={handleRadioButton}
                    style={theme.components.radio as React.CSSProperties}
                  />
                </$GridCell>
                {inspectorMode === 'ahjo' ? (
                  <$GridCell $colSpan={12}>
                    <hr />
                  </$GridCell>
                ) : null}
              </$FormSection>

              {inspectorMode === 'ahjo' ? (
                <$FormSection>
                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t(
                        'common:batches.form.fields.expertInspectorName'
                      )}
                      id={`expert_inspector_name${id}`}
                      name="expert_inspector_name"
                      errorText={getErrorMessage('expert_inspector_name')}
                      invalid={!!formik.errors.expert_inspector_name}
                      value={formik.values.expert_inspector_name ?? ''}
                      required={inspectorMode === 'ahjo'}
                    />
                  </$GridCell>

                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t(
                        'common:batches.form.fields.expertInspectorTitle'
                      )}
                      id={`expert_inspector_title_${id}`}
                      name="expert_inspector_title"
                      errorText={getErrorMessage('expert_inspector_title')}
                      invalid={!!formik.errors.expert_inspector_title}
                      value={formik.values.expert_inspector_title ?? ''}
                      required={inspectorMode === 'ahjo'}
                    />
                  </$GridCell>
                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t('common:batches.form.fields.p2pCheckerName')}
                      id={`p2p_checker_name_${id}`}
                      name="p2p_checker_name"
                      errorText={getErrorMessage('p2p_checker_name')}
                      invalid={!!formik.errors.p2p_checker_name}
                      value={formik.values.p2p_checker_name ?? ''}
                      required={inspectorMode === 'ahjo'}
                    />
                  </$GridCell>
                </$FormSection>
              ) : null}
            </$InspectionTypeContainer>

            <$InspectionTypeContainer>
              <$FormSection>
                <$GridCell $colSpan={12}>
                  <RadioButton
                    key={`inspector-mode-${id}-p2p`}
                    id={`inspector-mode-${id}-p2p`}
                    value="p2p"
                    label="P2P-tarkastus"
                    name="inspection_mode"
                    checked={inspectorMode === 'p2p'}
                    onChange={handleRadioButton}
                    style={theme.components.radio as React.CSSProperties}
                  />
                </$GridCell>
                {inspectorMode === 'p2p' ? (
                  <$GridCell $colSpan={12}>
                    <hr />
                  </$GridCell>
                ) : null}
              </$FormSection>
              {inspectorMode === 'p2p' ? (
                <$FormSection css="border-top: 1pox solid #000;">
                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t('common:batches.form.fields.p2pInspectorName')}
                      id={`p2p_inspector_name${id}`}
                      name="p2p_inspector_name"
                      errorText={getErrorMessage('p2p_inspector_name')}
                      invalid={!!formik.errors.p2p_inspector_name}
                      value={formik.values.p2p_inspector_name ?? ''}
                      required={inspectorMode === 'p2p'}
                    />
                  </$GridCell>

                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t('common:batches.form.fields.p2pInspectorEmail')}
                      id={`p2p_inspector_email_${id}`}
                      name="p2p_inspector_email"
                      errorText={getErrorMessage('p2p_inspector_email')}
                      invalid={!!formik.errors.p2p_inspector_email}
                      value={formik.values.p2p_inspector_email ?? ''}
                      required={inspectorMode === 'p2p'}
                    />
                  </$GridCell>
                  <$GridCell $colSpan={3}>
                    <TextInput
                      onChange={formik.handleChange}
                      label={t('common:batches.form.fields.p2pCheckerName')}
                      id={`p2p_checker_name_${id}`}
                      name="p2p_checker_name"
                      errorText={getErrorMessage('p2p_checker_name')}
                      invalid={!!formik.errors.p2p_checker_name}
                      value={formik.values.p2p_checker_name ?? ''}
                      required={inspectorMode === 'p2p'}
                    />
                  </$GridCell>
                </$FormSection>
              ) : null}
            </$InspectionTypeContainer>
          </>
        ) : null}
        <$FormSection>
          <$GridCell
            $colSpan={
              proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED ? 3 : 2
            }
          >
            <Button
              type="submit"
              theme="coat"
              variant="primary"
              css="min-width: 284px;"
            >
              {proposalForDecision === PROPOSALS_FOR_DECISION.ACCEPTED
                ? t('common:batches.actions.markToTalpa')
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

export default BatchFooterInspection;
