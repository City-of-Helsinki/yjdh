import { Button, IconArrowLeft, IconArrowRight, IconTrash } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';

import { $ButtonContainer } from '../ApplicationForm.sc';

type ActionBarProps = {
  handleDelete?: () => void;
  handleSave?: () => void;
  handleSubmit?: () => void;
  handleBack?: () => void;
  handleSaveDraft: () => void;
  id: string | string[] | undefined;
};

const ActionBarNew: React.FC<ActionBarProps> = ({
  handleDelete,
  handleSave,
  handleBack,
  handleSubmit,
  handleSaveDraft,
  id,
}: ActionBarProps) => {
  const { t } = useTranslation();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const translationsBase = 'common:applications.actions';
  const router = useRouter();

  return (
    <>
      <$Grid>
        <$GridCell $colSpan={6}>
          <$ButtonContainer>
            {handleBack && (
              <Button
                theme="black"
                variant="secondary"
                onClick={handleBack}
                iconLeft={<IconArrowLeft />}
                css={{ marginRight: 'var(--spacing-2-xs)' }}
              >
                {t(`${translationsBase}.back`)}
              </Button>
            )}
            {handleSave && (
              <Button
                theme="coat"
                onClick={handleSave}
                iconRight={<IconArrowRight />}
                data-testid="nextButton"
              >
                {t(`${translationsBase}.continue`)}
              </Button>
            )}
            {handleSubmit && (
              <Button
                theme="coat"
                onClick={handleSubmit}
                iconRight={<IconArrowRight />}
                data-testid="nextButton"
              >
                {t(`${translationsBase}.send`)}
              </Button>
            )}
          </$ButtonContainer>
        </$GridCell>
        <>
          <$GridCell $colSpan={3} $colStart={7}>
            <$ButtonContainer>
              <Button
                theme="black"
                variant="secondary"
                onClick={handleSaveDraft}
              >
                {t(`${translationsBase}.saveAndContinueLater`)}
              </Button>
            </$ButtonContainer>
          </$GridCell>
          <$GridCell $colSpan={3} $colStart={10} justifySelf="end">
            <$ButtonContainer>
              <Button
                theme="black"
                variant="supplementary"
                iconLeft={<IconTrash />}
                onClick={() =>
                  id ? setIsConfirmationModalOpen(true) : router.push('/')
                }
                data-testid="deleteButton"
              >
                {t(`${translationsBase}.deleteApplication`)}
              </Button>
            </$ButtonContainer>
          </$GridCell>
        </>
      </$Grid>
      {isConfirmationModalOpen && handleDelete && (
        <Modal
          id="ActionBar-confirmDeleteApplicationModal"
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

export default ActionBarNew;
