import { useTranslation } from 'benefit/applicant/i18n';
import { Button, IconArrowLeft, IconArrowRight, IconCross } from 'hds-react';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';

type StepperActionsProps = {
  lastStep?: boolean;
  disabledNext?: boolean;
  handleBack?: () => void;
  handleDelete?: () => void;
  handleSubmit: () => void;
  handleSave: () => void;
};

const StepperActions: React.FC<StepperActionsProps> = ({
  lastStep,
  disabledNext,
  handleBack,
  handleDelete,
  handleSubmit,
  handleSave,
}: StepperActionsProps) => {
  const { t } = useTranslation();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const translationsBase = 'common:applications.actions';

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
          <Button theme="black" variant="secondary" onClick={handleSave}>
            {t(`${translationsBase}.saveAndContinueLater`)}
          </Button>
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
              {t(`${translationsBase}.deleteApplication`)}
            </Button>
          </$GridCell>
        )}
      </$Grid>
      {isConfirmationModalOpen && handleDelete && (
        <Modal
          id="StepperActions-confirmDeleteApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(`${translationsBase}.deleteApplicationConfirm`)}
          submitButtonLabel={t(`${translationsBase}.deleteApplication`)}
          cancelButtonLabel={t(`${translationsBase}.close`)}
          handleToggle={() => setIsConfirmationModalOpen(false)}
          handleSubmit={handleDelete}
          variant="danger"
        >
          {t(`${translationsBase}.deleteApplicationDescription`)}
        </Modal>
      )}
    </>
  );
};

const defaultProps = {
  lastStep: false,
  handleBack: undefined,
  handleDelete: undefined,
  disabledNext: false,
};

StepperActions.defaultProps = defaultProps;

export default StepperActions;
