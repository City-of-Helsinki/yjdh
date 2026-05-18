import { ButtonPresetTheme, ButtonVariant, Dialog } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Button from 'shared/components/button/Button';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import type { ModalProps } from 'shared/components/modal/Modal';

type ComponentProps = {
  onClose: () => void;
  onSubmit: () => void;
  text?: string;
  heading?: string;
  variant: ModalProps['variant'];
};

/**
 * Generic confirmation dialog content for shared/components/modal/Modal.
 * Use when you need confirmation input from the user.
 * @param {function} onClose - Function to be invoked when "cancel" is pressed
 * @param {function} onSubmit - Function to be invoked when "confirm" is pressed
 * @param {String} heading - Heading text for the dialog window
 * @param {String} text - Body text for the dialog window
 * @param {ModalProps['variant']} variant - HDS variant to change dialog style
 * @return {React.ReactElement} React element
 *
 */
const ConfirmModalContent: React.FC<ComponentProps> = ({
  onClose,
  onSubmit,
  heading,
  text,
  variant = ButtonVariant.Primary,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Dialog.Content>
        <$Grid>
          {heading ? (
            <$GridCell $colSpan={12} $rowSpan={3}>
              <h3>{heading}</h3>
            </$GridCell>
          ) : null}

          {text ? (
            <$GridCell $colSpan={12}>
              <p>{text}</p>
            </$GridCell>
          ) : null}
        </$Grid>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          onClick={onClose}
          data-testid="confirm-cancel"
        >
          {t('common:utility.cancel')}
        </Button>
        <Button
          theme={ButtonPresetTheme.Coat}
          variant={variant}
          onClick={onSubmit}
          data-testid="confirm-ok"
        >
          {t('common:utility.confirm')}
        </Button>
      </Dialog.ActionButtons>
    </>
  );
};

export default ConfirmModalContent;
