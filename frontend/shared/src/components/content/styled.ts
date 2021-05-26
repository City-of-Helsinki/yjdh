import styled from 'styled-components';

const StyledContainer = styled.div`
  display: grid;
  grid-row: span;
  grid-template-columns: 1fr 10fr 1fr;

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