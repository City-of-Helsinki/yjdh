import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $LinkSection = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.theme.spacing.xs2} 1fr ${(props) => props.theme.spacing.xs2};
  padding: ${(props) => props.theme.spacing.xs};
    margin-bottom: ${(props) => props.theme.spacing.xl2};

  ${respondAbove('md')`
    grid-template-columns: 1fr minmax(auto, 1200px) 1fr;
  `};

  & > * {
    grid-column: 2;
`;

export const $Links = styled.div`
  div:first-child {
    margin-bottom: ${(props) => props.theme.spacing.l};
  }

  @media (min-width: ${(props) => props.theme.breakpoints.m}) {
    display: flex;
    flex: row wrap;

    div:first-child {
      margin-right: ${(props) => props.theme.spacing.xl};
      margin-bottom: 0;
    }
  }
`;
