import * as React from 'react';

import { $Content, $Required, FieldLabelProps } from './FieldLabel.sc';

const FieldLabel: React.FC<FieldLabelProps> = ({ value, required }) => (
  <$Content required={required}>
    {value}
    {required && <$Required>*</$Required>}
  </$Content>
);

export default FieldLabel;
