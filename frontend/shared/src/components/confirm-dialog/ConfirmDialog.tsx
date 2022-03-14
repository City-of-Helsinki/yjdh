import { IconQuestionCircle } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Modal, { ModalProps } from 'shared/components/modal/Modal';
import useConfirm from 'shared/hooks/useConfirm';

const ConfirmDialog: React.FC<Partial<ModalProps>> = (modalProps) => {
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
      headerIcon={<IconQuestionCircle aria-hidden="true" />}
      {...modalProps}
    >
      {confirmState.content?.length ? confirmState.content : null}
      {confirmState.link?.length && confirmState.linkText?.length ? (
        <a target="_blank" rel="noopener noreferrer" href={confirmState.link}>
          {' '}
          {confirmState.linkText}
        </a>
      ) : null}
    </Modal>
  ) : null;
};

export default ConfirmDialog;
