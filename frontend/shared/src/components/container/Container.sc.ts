import { respondAbove } from 'shared/styles/mediaQueries';
import theme from 'shared/styles/theme';
import styled from 'styled-components';

export type ContainerProps = { backgroundColor?: string };

const gridTemplateColumns = `grid-template-columns: 1fr minmax(auto, 
  ${theme.contentWidth.max}) 1fr;`;

export const $Container = styled.div<ContainerProps>`
  display: grid;
  background-color: ${(props) => props.backgroundColor || ''};
  grid-template-columns: ${(props) => props.theme.spacing.xs2} 1fr ${(props) =>
      props.theme.spacing.xs2};

  ${respondAbove('md')(gridTemplateColumns)}

  & > * {
    grid-column: 2;
  }
`;

export const $Inner = styled.div`
  padding: ${(props) => props.theme.spacing.xs};
`;
