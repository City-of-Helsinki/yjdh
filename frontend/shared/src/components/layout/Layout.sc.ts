import styled, { DefaultTheme } from 'styled-components';

export const $Main = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
`;

export const $Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.m};
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs};
  & > div {
    flex: 1 0 50%;
  }
`;

export const $HeaderItem = styled.div``;

export const $Heading = styled.h1`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.heading.xl};
  font-weight: normal;
  margin: 0;
`;
