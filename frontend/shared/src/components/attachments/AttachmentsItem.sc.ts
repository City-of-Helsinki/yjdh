import styled, { DefaultTheme } from 'styled-components';

export const $Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
`;

export const $Title = styled.a`
  display: flex;
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArmsLight};
  border-bottom: 1px dashed
    ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  &:focus {
    outline: 3px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  }
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black};
  text-decoration: none;
  cursor: pointer;
`;

export const $ActionContainer = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  &:focus {
    outline: 3px solid
      ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  }
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.black};
  text-decoration: none;
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  min-width: 120px;
`;
