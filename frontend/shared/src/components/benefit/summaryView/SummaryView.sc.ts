import styled, { DefaultTheme } from 'styled-components';

type ViewFieldProps = {
  isInline?: boolean;
  isBold?: boolean;
  isBig?: boolean;
};

type SummaryTableValueProps = {
  isBold?: boolean;
};

const summaryViewShouldForwardProp = (prop: string): boolean =>
  !['isInline', 'isBold', 'isBig'].includes(prop);

const summaryTableValueShouldForwardProp = (prop: string): boolean =>
  prop !== 'isBold';

export const $ViewField = styled.div.withConfig({
  shouldForwardProp: summaryViewShouldForwardProp,
})<ViewFieldProps>`
  &:not(:last-child) {
    padding-bottom: ${(
      props: {
        theme: DefaultTheme;
        children?: React.ReactNode;
      } & ViewFieldProps
    ) => (props.children ? props.theme.spacing.xs4 : 0)};
  }
  display: ${(props: ViewFieldProps) => (props.isInline ? 'inline' : 'block')};
  font-weight: ${(props: ViewFieldProps) => (props.isBold ? 500 : 400)};
  font-size: ${(props: { theme: DefaultTheme } & ViewFieldProps) =>
    props.isBig ? props.theme.fontSize.heading.m : props.theme.fontSize.body.l};
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;

export const $SummaryTableHeader = styled.div`
  &:not(:last-child) {
    padding-bottom: ${(props: {
      theme: DefaultTheme;
      children?: React.ReactNode;
    }) => (props.children ? props.theme.spacing.xs2 : 0)};
  }
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $SummaryTableValue = styled.span.withConfig({
  shouldForwardProp: summaryTableValueShouldForwardProp,
})<SummaryTableValueProps>`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
  font-weight: ${(props: SummaryTableValueProps) =>
    props.isBold ? '600' : ''};
`;
