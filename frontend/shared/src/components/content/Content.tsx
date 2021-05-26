import * as React from 'react';
import { StyledContainer, StyledInner } from './styled';

type ContentProps = { children: React.ReactNode };

const Content = ({ children }: ContentProps): JSX.Element => (
  <StyledContainer>
    <StyledInner>{children}</StyledInner>
  </StyledContainer>
);

export default Content;
