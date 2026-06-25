import {
  ButtonProps as HdsButtonProps,
  ButtonVariant,
  LoadingSpinner,
} from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import $Button from './Button.sc';

export type ButtonProps = Omit<HdsButtonProps, 'children'> & {
  loadingText?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
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
      <$Button
        {...props}
        ref={ref}
        disabled={disabled}
        iconStart={iconStart}
        variant={variant as ButtonVariant}
      >
        {buttonText}
      </$Button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
