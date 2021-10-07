import { createGlobalStyle } from 'styled-components';

import { Fonts } from './fonts';
import { Main } from './main';

const GlobalStyle = createGlobalStyle`
  ${Fonts}
  ${Main}

  h1 {
    margin: ${(props) => props.theme.spacing.l} 0;
    font-size: ${(props) => props.theme.fontSize.heading.l};
  }

  h2 {
    margin: ${(props) => props.theme.spacing.m} 0;
    font-size: ${(props) => props.theme.fontSize.heading.m};
    font-weight: 500;
  }

  h3 {
    margin: ${(props) => props.theme.spacing.s} 0;
    font-size: ${(props) => props.theme.fontSize.heading.s};
  }
  pre {
    margin: 0;
    white-space: initial;
  }
`;
export default GlobalStyle;
