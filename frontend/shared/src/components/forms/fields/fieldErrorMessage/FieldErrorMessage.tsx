import { IconAlertCircleFill } from 'hds-react';
import React from 'react';

import { $FieldErrorMessage } from './FieldErrorMessage.sc';

type Props = {
  'data-testid': string;
};
const FieldErrorMessage: React.FC<Props> = ({
  'data-testid': dataTestId,
  children,
}) => (
  <$FieldErrorMessage data-testid={dataTestId}>
    <IconAlertCircleFill size="s" />
    {children}
  </$FieldErrorMessage>
);

export default FieldErrorMessage;
