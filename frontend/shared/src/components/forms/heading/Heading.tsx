import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';

import { $Header, HeadingProps } from './Heading.sc';

const Heading: React.FC<HeadingProps> = ({
  as,
  size = 'l',
  header,
  loading,
  tooltip,
}) => (
  <$Header size={size} as={as}>
    {header}
    {tooltip && <Tooltip>{tooltip}</Tooltip>}
    {loading && <LoadingSpinner small />}
  </$Header>
);

export default Heading;
