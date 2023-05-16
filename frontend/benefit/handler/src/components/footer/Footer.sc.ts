import styled from 'styled-components';

type Props = {
  layoutBackgroundColor: string;
};

export const $FooterWrapper = styled.div<Props>`
  padding-top: ${(props) => props.theme.spacing.xl4};
  background-color: ${(props) => props.layoutBackgroundColor};
`;
