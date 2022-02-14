import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { HeadingProps } from 'shared/components/forms/heading/Heading.sc';

import { $GridCell, GridCellProps } from './FormSection.sc';

type Props = HeadingProps & GridCellProps;
const FormSectionHeading: React.FC<Props> = ({
  as,
  'data-testid': dataTestId,
  ...props
}: Props) => (
  <$GridCell {...props}>
    <Heading as={as} data-testid={dataTestId} {...props} />
  </$GridCell>
);

export default FormSectionHeading;
