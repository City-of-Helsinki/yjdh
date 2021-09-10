import { breakpoints } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $Main = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: ${breakpoints.lg}px;
`;
