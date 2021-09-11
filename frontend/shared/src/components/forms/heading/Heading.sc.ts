import styled, { DefaultTheme } from 'styled-components';

export interface HeadingProps {
  size: keyof DefaultTheme['fontSize']['heading'];
}

export const $Header = styled.h1<HeadingProps>`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.s};
  font-weight: 500;
`;
