import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $ActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 30%;
  box-sizing: border-box;
  ${respondAbove('sm')`
    justify-content: flex-end;
  `}
`;
