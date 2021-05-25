import * as React from 'react';
import { StyledContainer } from './styled';

type ContentProps = { children: React.ReactNode };

const Content = ({ children }: ContentProps): JSX.Element => (
  <StyledContainer>{children}</StyledContainer>
);

export default Content;
