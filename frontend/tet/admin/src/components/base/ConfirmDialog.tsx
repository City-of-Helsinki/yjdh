import React from 'react';
import Modal from 'shared/components/modal/Modal';
import useConfirm from 'tet/admin/hooks/context/useConfirm';

const ConfirmDialog = () => {
  const { onConfirm, onCancel, confirmState } = useConfirm();

  const component = confirmState.show ? (
    <Modal
      id="confirmation_dialog"
      isOpen={confirmState.show}
      title={confirmState.header}
      submitButtonLabel={'Hyväksy'}
      handleToggle={onCancel}
      handleSubmit={onConfirm}
      variant="danger"
    >
      {confirmState.content?.length ? confirmState.content : null}
    </Modal>
  ) : null;

  return component;
};
export default ConfirmDialog;
