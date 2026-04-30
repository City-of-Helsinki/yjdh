import { Button as HdsButton, ButtonProps as HdsButtonProps, ButtonVariant, LoadingSpinner } from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export type ButtonProps = HdsButtonProps & {
  loadingText?: string;
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  loadingText,
  isLoading,
  ...props
}) => {
  const { t } = useTranslation();
  const buttonText = isLoading ? loadingText || t('common:loading') : props.children;
  const disabled = isLoading || props.disabled;
  const iconStart = isLoading ? <LoadingSpinner small /> : props.iconStart;
  const variant = isLoading ? ButtonVariant.Clear : props.variant;

  return (
    // @ts-expect-error - We can ignore this error since iconEnd is not used in all the variants
    <HdsButton {...props} disabled={disabled} iconStart={iconStart} variant={variant}>
      {buttonText}
    </HdsButton>
  );
};

export default Button;
