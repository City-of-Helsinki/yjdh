import styled, { DefaultTheme } from 'styled-components';

type Props = {
  layoutBackgroundColor: string;
  theme: DefaultTheme;
};

const footerWrapperShouldForwardProp = (prop: string): boolean =>
  prop !== 'layoutBackgroundColor';

export const $FooterWrapper = styled.div.withConfig({
  shouldForwardProp: footerWrapperShouldForwardProp,
})<Props>`
  padding-top: ${(props: Props) => props.theme.spacing.xl4};
  background-color: ${(props: Props) => props.layoutBackgroundColor};
`;
