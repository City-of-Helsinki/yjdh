import * as React from 'react';

import { FieldLabelProps, StyledContent, StyledRequired } from './styled';

const FieldLabel: React.FC<FieldLabelProps> = ({ value, required }) => (
  <StyledContent required={required}>
    {value}
    {required && <StyledRequired>*</StyledRequired>}
  </StyledContent>
);

export default FieldLabel;
