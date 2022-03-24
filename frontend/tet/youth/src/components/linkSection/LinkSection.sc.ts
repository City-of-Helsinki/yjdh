import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $LinkSection = styled.div`
  display: grid;
  grid-template-columns: ${(props) => props.theme.spacing.xs2} 1fr ${(props) => props.theme.spacing.xs2};

  ${respondAbove('md')`
    grid-template-columns: 1fr minmax(auto, 1200px) 1fr;
  `};

  & > * {
    grid-column: 2;
`;
