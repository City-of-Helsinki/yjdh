import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';
import { DefaultTheme } from 'styled-components';

import { $Header } from './Heading.sc';

type HeadingProps = {
  size?: keyof DefaultTheme['fontSize']['heading'];
  as?: 'h1' | 'h2' | 'h3';
  header?: string;
  loading?: boolean;
  tooltip?: string;
};

const Heading: React.FC<HeadingProps> = ({
  as,
  size,
  header,
  loading,
  tooltip,
}) => (
  <$Header size={size || 'm'} as={as}>
    {header}
    {tooltip && <Tooltip>{tooltip}</Tooltip>}
    {loading && <LoadingSpinner small />}
  </$Header>
);

export default Heading;
