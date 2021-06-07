import * as React from 'react';

import { StyledContent } from './styled';

type ContentProps = { children: React.ReactNode };

const Content: React.FC<ContentProps> = ({ children }) => (
  <StyledContent>{children}</StyledContent>
);

export default Content;
