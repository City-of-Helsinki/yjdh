import { IconAlertCircleFill } from 'hds-react';
import React from 'react';

import { $FieldErrorMessage } from './FieldErrorMessage.sc';

const FieldErrorMessage: React.FC = ({ children }) => (
  <$FieldErrorMessage>
    <IconAlertCircleFill size="s" />
    {children}
  </$FieldErrorMessage>
);

export default FieldErrorMessage;
