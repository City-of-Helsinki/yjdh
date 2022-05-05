import { IconAlertCircleFill } from 'hds-react';
import React from 'react';

import { $FieldErrorMessage, Props } from './FieldErrorMessage.sc';

const FieldErrorMessage: React.FC<Props> = ({
  'data-testid': dataTestId,
  children,
  small,
}) => (
  <$FieldErrorMessage data-testid={dataTestId} small={small}>
    <IconAlertCircleFill size="s" />
    {children}
  </$FieldErrorMessage>
);

export default FieldErrorMessage;
