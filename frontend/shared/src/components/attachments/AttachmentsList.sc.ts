import styled, { DefaultTheme } from 'styled-components';

export const $Container = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.silverLight};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
  padding-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $Heading = styled.h3`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.heading.s};
  font-weight: 600;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $Message = styled.span`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.l};
`;
