import { SupplementaryButtonProps } from 'hds-react';
import React from 'react';

import $LinkButton from './LinkButton.sc';

type Props = Omit<SupplementaryButtonProps, 'size' | 'variant' | 'disabled'>;

/**
 * LinkButton is a button that looks like a link.
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
