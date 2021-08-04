import { breakpoints } from 'shared/styles/mediaQueries';
import $ from 'styled-components';

export const $Main = $.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: ${breakpoints.lg}px;
`;
