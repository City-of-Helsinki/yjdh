import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

interface ContainerProps {
  backgroundColor?: string;
}

const StyledContainer = styled.div<ContainerProps>`
  display: grid;
  background-color: ${(props) => props.backgroundColor || ''};
  grid-template-columns: ${(props) => props.theme.spacing.xs2} 1fr ${(props) =>
      props.theme.spacing.xs2};

  ${respondAbove('md')`
    grid-template-columns: 1fr minmax(auto, 1240px) 1fr;
  `};

  & > * {
    grid-column: 2;
  }
`;

const StyledInner = styled.div`
  padding: ${(props) => props.theme.spacing.xs};
`;

export { StyledContainer, StyledInner };
