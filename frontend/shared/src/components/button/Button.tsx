import {
  Button as HdsButton,
  ButtonProps as HdsButtonProps,
  ButtonVariant,
  LoadingSpinner,
} from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export type ButtonProps = HdsButtonProps & {
  loadingText?: string;
  isLoading?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loadingText, isLoading, ...props }, ref) => {
    const { t } = useTranslation();
    const buttonText = isLoading
      ? loadingText || t('common:loading')
      : props.children;
    const disabled = isLoading || props.disabled;
    const iconStart = isLoading ? <LoadingSpinner small /> : props.iconStart;
    const variant = isLoading ? ButtonVariant.Clear : props.variant;

    return (
      <HdsButton
        {...props}
        ref={ref}
        disabled={disabled}
        iconStart={iconStart}
        variant={variant as ButtonVariant}
      >
        {buttonText}
      </HdsButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
