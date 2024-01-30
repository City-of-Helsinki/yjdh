import styled from 'styled-components';

export const $ChangeRowValue = styled.dd`
  display: flex;
  align-items: center;
  margin-left: 0;
  margin-bottom: ${(props) => props.theme.spacing.xs};
  svg {
    margin: 0 ${(props) => props.theme.spacing.xs3};
    width: 18px;
    height: 18px;
  }

  span {
    white-space: pre;
  }
`;

export const $ChangeRowLabel = styled.dt`
  margin: 0;
`;
