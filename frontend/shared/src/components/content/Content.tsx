import * as React from 'react';

import { StyledContent } from './styled';

type ContentProps = { children: React.ReactNode };

const Content = ({ children }: ContentProps): JSX.Element => (
  <StyledContent>{children}</StyledContent>
);

export default Content;
