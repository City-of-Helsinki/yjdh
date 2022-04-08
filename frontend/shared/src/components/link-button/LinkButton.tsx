import { SupplementaryButtonProps, ButtonProps } from 'hds-react';
import React from 'react';

import $LinkButton from './LinkButton.sc';

type Props = Omit<SupplementaryButtonProps, 'size' | 'variant' | 'disabled'>;

/**
 * LinkText for NextJs link which is inside Trans-component.
 * See more: https://github.com/i18next/react-i18next/issues/1090#issuecomment-884927848
 */
const LinkButton: React.FC<Props> = ({
  children,
  isLoading,
  loadingText,
  ...rest
}: Props) => (
  // for some reason variant="supplementary" isn't allowed by typescript
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <$LinkButton
    variant="supplementary"
    isLoading={isLoading}
    loadingText={loadingText}
    {...rest}
  >
    {children}
  </$LinkButton>
);

export default LinkButton;
