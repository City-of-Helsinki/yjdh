import { respondAbove } from 'shared/styles/mediaQueries';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme> & { backgroundColor?: string };

interface ContainerProps {
  backgroundColor?: string;
}

const StyledContainer = styled.div<ContainerProps>`
  display: grid;
  background-color: ${(props: Props) => props.backgroundColor || ''};
  grid-template-columns: ${(props: Props) => props.theme.spacing.xs2} 1fr ${(
      props: Props
    ) => props.theme.spacing.xs2};

  ${respondAbove('md')`
    grid-template-columns: 1fr minmax(auto, 1240px) 1fr;
  `};

  & > * {
    grid-column: 2;
  }
`;

const StyledInner = styled.div`
  padding: ${(props: Props) => props.theme.spacing.xs};
`;

export { StyledContainer, StyledInner };
