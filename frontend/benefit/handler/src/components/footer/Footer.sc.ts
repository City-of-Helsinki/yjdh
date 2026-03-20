import styled, { DefaultTheme } from 'styled-components';

type Props = {
  layoutBackgroundColor: string;
  theme: DefaultTheme;
};

export const $FooterWrapper = styled.div<Props>`
  padding-top: ${(props: Props) => props.theme.spacing.xl4};
  background-color: ${(props: Props) => props.layoutBackgroundColor};
`;
