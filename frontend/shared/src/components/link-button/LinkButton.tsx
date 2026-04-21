import { ButtonProps, ButtonVariant } from 'hds-react';
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

  return <$LinkButton {...linkButtonProps}>{children}</$LinkButton>;
};

export default LinkButton;
