import styled, { DefaultTheme } from 'styled-components';

export interface SpacingProps {
  size: keyof DefaultTheme['spacing'];
}

const StyledContent = styled.div<SpacingProps>`
  width: 100%;
  height: ${(props) => props.theme.spacing[props.size]};
`;

export { StyledContent };
