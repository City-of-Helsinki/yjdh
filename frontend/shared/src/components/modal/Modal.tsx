import { Button, Dialog, DialogVariant } from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export type ModalProps = {
  id: string;
  submitButtonLabel: string;
  actionDisabled?: boolean;
  title?: string;
  className?: string;
  isOpen: boolean;
  scrollable?: boolean;
  variant?: DialogVariant;
  handleToggle: () => void;
  handleSubmit: (e: React.SyntheticEvent) => void;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
  actionDisabled,
  id,
  title,
  className,
  isOpen,
  scrollable,
  submitButtonLabel,
  variant,
  handleToggle,
  handleSubmit,
  children,
}) => {
  const { t } = useTranslation();
  const onAccept = (e: React.SyntheticEvent): void => {
    handleSubmit(e);
    handleToggle();
  };
  const titleId = `${id}-dialog-title`;
  const closeButtonLabelText = t('common:applications.actions.close');

  return (
    <Dialog
      id={id}
      aria-labelledby={titleId}
      isOpen={isOpen}
      className={className}
      close={handleToggle}
      closeButtonLabelText={closeButtonLabelText}
      scrollable={scrollable}
      variant={variant}
    >
      {title && <Dialog.Header title={title} id={id} />}
      {children && <Dialog.Content>{children}</Dialog.Content>}
      <Dialog.ActionButtons>
        <Button theme="black" variant="secondary" onClick={handleToggle}>
          {t('common:applications.actions.close')}
        </Button>
        <Button
          theme="coat"
          variant={variant}
          onClick={onAccept}
          disabled={actionDisabled}
        >
          {submitButtonLabel}
        </Button>
      </Dialog.ActionButtons>
    </Dialog>
  );
};

export default Modal;
