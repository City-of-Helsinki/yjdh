import {
  ButtonProps as HdsButtonProps,
  ButtonVariant,
  LoadingSpinner,
} from 'hds-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { $Button } from './Button.sc';

const StyledButton = $Button as React.ComponentType<
  HdsButtonProps & React.RefAttributes<HTMLButtonElement>
>;

export type ButtonProps = Omit<HdsButtonProps, 'children'> &
  React.PropsWithChildren<{
    loadingText?: string;
    isLoading?: boolean;
  }>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loadingText, isLoading, ...props }, ref) => {
    const { t } = useTranslation();
    const normalizedProps: HdsButtonProps = {
      ...props,
      children: (isLoading
        ? loadingText || t('common:loading')
        : props.children) as string,
      disabled: isLoading || props.disabled,
      variant: isLoading
        ? ButtonVariant.Clear
        : props.variant ?? ButtonVariant.Primary,
      iconStart: isLoading ? <LoadingSpinner small /> : props.iconStart ?? null,
    };

    return <StyledButton {...normalizedProps} ref={ref} />;
  }
);

Button.displayName = 'Button';

export default Button;
