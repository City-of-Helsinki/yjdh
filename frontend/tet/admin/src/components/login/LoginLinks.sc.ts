import styled from 'styled-components';

export const $LoginLinks = styled.div`
  margin-left: auto;
  margin-right: auto;
  margin-bottom: ${(props) => props.theme.spacing.l};
  display: grid;
  grid-gap: ${(props) => props.theme.spacing.m};

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
