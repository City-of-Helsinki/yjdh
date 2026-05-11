import { ButtonProps, ButtonVariant, LoadingSpinner } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import $LinkButton from './LinkButton.sc';

type Props = Omit<ButtonProps, 'size' | 'variant'> & {
  isLoading?: boolean;
  loadingText?: string;
};

/**
 * LinkButton is a button that looks like a link.
 */
const LinkButton: React.FC<Props> = ({
  children,
  isLoading,
  loadingText,
  ...rest
}: Props) => {
  const linkButtonProps = {
    ...rest,
    isLoading,
    loadingText,
    variant: ButtonVariant.Supplementary,
  } as React.ComponentProps<typeof $LinkButton>;
  const { t } = useTranslation();
  const buttonText = isLoading ? loadingText || t('common:loading') : children;
  const disabled = isLoading || rest.disabled;
  const iconStart = isLoading ? <LoadingSpinner small /> : rest.iconStart;

  return (
    <$LinkButton {...linkButtonProps} iconStart={iconStart} disabled={disabled}>
      {buttonText}
    </$LinkButton>
  );
};

export default LinkButton;
