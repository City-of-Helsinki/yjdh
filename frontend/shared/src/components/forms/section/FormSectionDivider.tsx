import * as React from 'react';

import { $GridCell, $Hr, GridCellProps } from './FormSection.sc';

const FormSectionDivider: React.FC<GridCellProps> = (
  gridProps: GridCellProps
) => (
  <$GridCell {...gridProps}>
    <$Hr />
  </$GridCell>
);

export default FormSectionDivider;
