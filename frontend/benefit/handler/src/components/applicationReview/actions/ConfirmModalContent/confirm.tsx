import { Button, Dialog, DialogVariant } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

type ComponentProps = {
  onClose: () => void;
  onSubmit: () => void;
  text?: string;
  heading?: string;
  variant: DialogVariant;
};

/**
 * Generic confirmation dialog content for shared/components/modal/Modal.
 * Use when you need confirmation input from the user.
 * @param {function} onClose - Function to be invoked when "cancel" is pressed
 * @param {function} onSubmit - Function to be invoked when "confirm" is pressed
 * @param {String} heading - Heading text for the dialog window
 * @param {String} text - Body text for the dialog window
 * @param {DialogVariant} variant - HDS DialogVariant to change dialog style
 * @return {React.ReactElement} React element
 *
 */
const ConfirmModalContent: React.FC<ComponentProps> = ({
  onClose,
  onSubmit,
  heading,
  text,
  variant = 'primary',
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
          theme="black"
          variant="secondary"
          onClick={onClose}
          data-testid="confirm-cancel"
        >
          {t('common:utility.cancel')}
        </Button>
        <Button
          theme="coat"
          variant={variant === 'danger' ? 'danger' : 'primary'}
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
