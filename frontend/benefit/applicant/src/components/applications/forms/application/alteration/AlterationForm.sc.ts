import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: ${(props) => props.theme.spacingLayout.s};
`;

export const $SaveActionFormErrorText = styled.div`
  ${respondAbove('sm')`
    text-align: right;
  `};

  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.error};
  svg {
    width: 48px;
    fill: ${(props) => props.theme.colors.error};
  }
`;
