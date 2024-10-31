import { useTranslation } from 'benefit/applicant/i18n';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  Button,
  IconAlertCircleFill,
  IconArrowLeft,
  IconArrowRight,
  IconCross,
} from 'hds-react';
import React, { MouseEvent, useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

type StepperActionsProps = {
  lastStep?: boolean;
  disabledNext?: boolean;
  handleBack?: () => void;
  handleDelete?: () => void;
  handleSubmit: () => void;
  handleSave?: () => void;
  applicationStatus: APPLICATION_STATUSES;
};

const onClickSave = (e: MouseEvent, handleSave: () => void | false): void => {
  if (handleSave) {
    handleSave();
  }
  e.preventDefault();
};

const $SaveAction = styled.div`
  ${respondAbove('sm')`
    text-align: center;
  `}
`;
const $SaveActionFormErrorText = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.error};
  svg {
    width: 48px;
    fill: ${(props) => props.theme.colors.error};
  }
`;

const StepperActions: React.FC<StepperActionsProps> = ({
  lastStep,
  disabledNext,
  handleBack,
  handleDelete,
  handleSubmit,
  handleSave,
  applicationStatus,
}: StepperActionsProps) => {
  const { t } = useTranslation();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const translationsBase = 'common:applications.actions';

  const cancelModalTranslationsBase =
    applicationStatus === APPLICATION_STATUSES.DRAFT
      ? 'deleteApplication'
      : 'cancelApplication';

  return (
    <>
      <$Grid>
        <$GridCell $colSpan={3} justifySelf="start">
          {handleBack && (
            <Button
              theme="black"
              variant="secondary"
              iconLeft={<IconArrowLeft />}
              onClick={handleBack}
            >
              {t(`${translationsBase}.back`)}
            </Button>
          )}
        </$GridCell>
        <$GridCell $colSpan={6} justifySelf="center">
          <$SaveAction>
            <Button
              theme="black"
              variant="secondary"
              onClick={(e) => onClickSave(e, handleSave)}
              disabled={!handleSave}
            >
              {t(`${translationsBase}.saveAndContinueLater`)}
            </Button>
            {!handleSave && (
              <$SaveActionFormErrorText>
                <IconAlertCircleFill />
                <p aria-live="polite">
                  {t('common:applications.errors.dirtyOrInvalidForm')}
                </p>
              </$SaveActionFormErrorText>
            )}
          </$SaveAction>
        </$GridCell>
        <$GridCell $colSpan={3} justifySelf="end">
          <Button
            theme="coat"
            disabled={disabledNext}
            iconRight={!lastStep ? <IconArrowRight /> : null}
            onClick={handleSubmit}
            data-testid="nextButton"
          >
            {lastStep
              ? t(`${translationsBase}.send`)
              : t(`${translationsBase}.continue`)}
          </Button>
        </$GridCell>
        {handleDelete && (
          <$GridCell $colSpan={10} $colStart={2} justifySelf="center">
            <Button
              theme="black"
              variant="supplementary"
              iconLeft={<IconCross />}
              onClick={() => setIsConfirmationModalOpen(true)}
              data-testid="deleteButton"
            >
              {t(`${translationsBase}.${cancelModalTranslationsBase}.action`)}
            </Button>
          </$GridCell>
        )}
      </$Grid>
      {isConfirmationModalOpen && handleDelete && (
        <Modal
          id="StepperActions-confirmDeleteApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(
            `${translationsBase}.${cancelModalTranslationsBase}.confirm.title`
          )}
          submitButtonLabel={t(
            `${translationsBase}.${cancelModalTranslationsBase}.action`
          )}
          cancelButtonLabel={t(`${translationsBase}.close`)}
          handleToggle={() => setIsConfirmationModalOpen(false)}
          handleSubmit={handleDelete}
          variant="danger"
        >
          {t(`${translationsBase}.${cancelModalTranslationsBase}.confirm.text`)}
        </Modal>
      )}
    </>
  );
};

export default StepperActions;
