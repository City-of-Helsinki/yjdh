import styled, { DefaultTheme } from 'styled-components';

export const $Wrapper = styled.div``;

export const $Background = styled.div`
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArms};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2} 0;
`;

export const $InnerWrapper = styled.div`
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.white};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $Col = styled.div`
  display: flex;
`;

export const $ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xl};
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.xl};
`;

export const $ItemHeader = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $ItemValue = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
`;

export const $HandlerWrapper = styled.div`
  border-radius: 50%;
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.white};
  color: ${(props: { theme: DefaultTheme }) => props.theme.colors.coatOfArms};
  padding: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.s};
  font-weight: 500;
  letter-spacing: 2px;
  line-height: ${(props: { theme: DefaultTheme }) => props.theme.lineHeight.l};
`;
