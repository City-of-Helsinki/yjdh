import styled, { DefaultTheme } from 'styled-components';

export const $Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $Column = styled.div`
  display: flex;
  gap: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
`;

export const $CustomNotesActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const $Header = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  font-weight: bold;
  padding-bottom: ${(props: { theme: DefaultTheme }) =>
    props.theme.spacing.xs3};
`;

export const $Text = styled.div`
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
`;
