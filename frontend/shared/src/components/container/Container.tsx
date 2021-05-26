import * as React from 'react';
import { StyledContainer, StyledInner } from './styled';

type ContainerProps = { children: React.ReactNode; backgroundColor?: string };

const Container = ({
  children,
  backgroundColor,
}: ContainerProps): JSX.Element => (
  <StyledContainer backgroundColor={backgroundColor || ''}>
    <StyledInner>{children}</StyledInner>
  </StyledContainer>
);

export default Container;
