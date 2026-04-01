import styled, { DefaultTheme } from 'styled-components';

type ViewFieldBoldProps = {
  large?: boolean;
  theme: DefaultTheme;
};

type ViewFieldProps = ViewFieldBoldProps & {
  isInline?: boolean;
  topMargin?: boolean;
  theme: DefaultTheme;
  children?: React.ReactNode;
};

export const $ViewField = styled.div<ViewFieldProps>`
  &:not(:last-child) {
    padding-bottom: ${(props: ViewFieldProps) =>
      props.children ? props.theme.spacing.s : 0};
  }
  margin-top: ${(props: ViewFieldProps) =>
    props.topMargin ? props.theme.spacing.xs : 0};
  display: ${(props: ViewFieldProps) => (props.isInline ? 'inline' : 'block')};
  font-weight: 400;
  font-size: ${(props: ViewFieldProps) =>
    props.large ? props.theme.fontSize.body.l : props.theme.fontSize.body.m};
`;

export const $ViewFieldBold = styled.div<ViewFieldBoldProps>`
  font-weight: 600;
  font-size: ${(props: ViewFieldBoldProps) =>
    props.large ? props.theme.fontSize.body.l : props.theme.fontSize.body.m};
`;

export const $SummaryTableHeader = styled.div`
  &:not(:last-child) {
    padding-bottom: ${(props: {
      children?: React.ReactNode;
      theme: DefaultTheme;
    }) => (props.children ? props.theme.spacing.xs2 : 0)};
  }
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $SummaryTableValue = styled.span`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
`;

export const $SummaryTableLastLine = styled.div`
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.body.xl};
  background-color: ${(props: { theme: DefaultTheme }) =>
    props.theme.colors.coatOfArmsLight};
  font-weight: 600;
`;

export const $MainHeading = styled.h1`
  display: inline-block;
  font-size: ${(props: { theme: DefaultTheme }) =>
    props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const $ButtonContainer = styled.span`
  margin-right: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
`;
