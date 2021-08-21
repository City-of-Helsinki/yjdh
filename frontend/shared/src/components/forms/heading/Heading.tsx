import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';
import { DefaultTheme } from 'styled-components';

import { $Header } from './Heading.sc';

type HeadingProps = {
  size?: keyof DefaultTheme['fontSize']['heading'];
  header?: string;
  loading?: boolean;
  loadingText?: string;
  loadingFinishedText?: string;
  tooltip?: string;
};

const Heading: React.FC<HeadingProps> = ({
  size,
  header,
  loading,
  tooltip,
}) => (
  <$Header size={size || 'm'}>
    {header}
    {tooltip && <Tooltip>{tooltip}</Tooltip>}
    {loading && <LoadingSpinner small />}
  </$Header>
);

export default Heading;
