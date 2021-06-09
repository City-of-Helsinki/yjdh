import * as React from 'react';

import { StyledContainer, StyledInner } from './styled';

type ContainerProps = { children: React.ReactNode; backgroundColor?: string };

const Container: React.FC<ContainerProps> = ({
  children,
  backgroundColor = '',
}: ContainerProps) => (
  <StyledContainer backgroundColor={backgroundColor}>
    <StyledInner>{children}</StyledInner>
  </StyledContainer>
);

const defaultProps = {
  backgroundColor: '',
};

Container.defaultProps = defaultProps;

export default Container;
