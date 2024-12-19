import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import { Button, Dialog, IconArrowRedo, IconArrowUndo } from 'hds-react';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import Modal from 'shared/components/modal/Modal';
import { useTheme } from 'styled-components';

import { useApplicationList } from './useApplicationList';

const TalpaStatusChangeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: INSTALMENT_STATUSES) => void;
}> = ({ isOpen, onClose, onStatusChange }) => {
  const { t } = useApplicationList();
  const theme = useTheme();

  return (
    <Modal
      id="dialog-talpa-payment-status-change"
      theme={theme.components.modal.coat}
      variant="primary"
      isOpen={isOpen}
      submitButtonLabel="yes"
      cancelButtonLabel="cancel"
      handleToggle={() => false}
      handleSubmit={() => false}
      customContent={
        <>
          <Dialog.Content>
            <$Grid columns={1} alignItems="center">
              <$GridCell>
                <h2>{t('applications.dialog.talpaStatusChange.heading')}</h2>
                <p>{t('applications.dialog.talpaStatusChange.text')}</p>
              </$GridCell>
            </$Grid>
          </Dialog.Content>

          <Dialog.ActionButtons>
            <Button
              theme="coat"
              iconLeft={<IconArrowUndo />}
              onClick={() => onStatusChange(INSTALMENT_STATUSES.ACCEPTED)}
            >
              {t('common:applications.list.actions.return_as_waiting')}
            </Button>
            <Button
              theme="coat"
              iconLeft={<IconArrowRedo />}
              onClick={() => onStatusChange(INSTALMENT_STATUSES.PAID)}
            >
              {t('common:applications.list.actions.mark_as_paid')}
            </Button>
            <Button theme="coat" variant="secondary" onClick={onClose}>
              {t('common:applications.actions.close')}
            </Button>
          </Dialog.ActionButtons>
        </>
      }
    />
  );
};

export default TalpaStatusChangeModal;
