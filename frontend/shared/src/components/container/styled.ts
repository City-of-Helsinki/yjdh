import styled, { StyledFunction } from 'styled-components';

interface ContainerProps {
  backgroundColor: string
}

const StyledContainer = styled.div<ContainerProps>`
  display: grid;
  grid-row: span;
  grid-template-columns: 1fr 10fr 1fr;
  background-color: ${props => props.backgroundColor};

  & > * {
    grid-column: 2;
  }
`;

const StyledInner = styled.div`
`;

export {
  StyledContainer,
  StyledInner
}