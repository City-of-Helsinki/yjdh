import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';

import { $Header, HeadingProps } from './Heading.sc';

const Heading: React.FC<HeadingProps> = ({
  size = 'l',
  header,
  loading,
  tooltip,
}) => (
  <$Header size={size}>
    {header}
    {tooltip && <Tooltip>{tooltip}</Tooltip>}
    {loading && <LoadingSpinner small />}
  </$Header>
);

export default Heading;
