import { LoadingSpinner, Tooltip } from 'hds-react';
import * as React from 'react';
import { DefaultTheme } from 'styled-components';

import { StyledHeader } from './styled';

type HeadingProps = {
  size?: keyof DefaultTheme['fontSize']['heading'];
  header?: string;
  loading?: boolean;
  tooltip?: string;
};

const Heading: React.FC<HeadingProps> = ({
  size,
  header,
  loading,
  tooltip,
}) => (
  <StyledHeader size={size || 'm'}>
    {header}
    {tooltip && <Tooltip>{tooltip}</Tooltip>}
    {loading && <LoadingSpinner small />}
  </StyledHeader>
);

export default Heading;
