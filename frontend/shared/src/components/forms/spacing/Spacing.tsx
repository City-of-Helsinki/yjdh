import * as React from 'react';

import { SpacingProps, StyledContent } from './styled';

const Spacing: React.FC<SpacingProps> = ({ size }) => (
  <StyledContent size={size} />
);

export default Spacing;
