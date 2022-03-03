import { useTranslation } from 'benefit/applicant/i18n';
import React from 'react';
import Modal from 'shared/components/modal/Modal';
import useConfirm from 'shared/hooks/useConfirm';

const ConfirmDialog: React.FC = () => {
  const { onConfirm, onCancel, confirmState } = useConfirm();
  const { t } = useTranslation();

  return confirmState.show ? (
    <Modal
      id="confirmation_dialog"
      isOpen={confirmState.show}
      title={confirmState.header}
      submitButtonLabel={confirmState.submitButtonLabel}
      cancelButtonLabel={t('common:dialog.cancel')}
      handleToggle={onCancel}
      handleSubmit={onConfirm}
      variant="primary"
    >
      {confirmState.content?.length ? confirmState.content : null}
    </Modal>
  ) : null;
};
export default ConfirmDialog;
