import { createGlobalStyle } from 'styled-components';

import {Fonts} from './fonts'
import {Main} from './main'

const GlobalStyle = createGlobalStyle`
  ${Fonts}
  ${Main}
`;
export default GlobalStyle;
