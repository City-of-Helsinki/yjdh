import { respondAbove } from 'shared/styles/mediaQueries';
import styled from 'styled-components';

export const $ActionContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: column;
  flex: 1 0 40%;
  box-sizing: border-box;

  hr {
    min-width: 280px;
    border: 0;
    border-top: 1px solid ${(props) => props.theme.colors.black30};
    border-bottom: 1px solid ${(props) => props.theme.colors.black10};
  }
  > button,
  .custom-combobox {
    width: 280px;
    margin: 5px 0;
  }
  ${respondAbove('sm')`
    justify-content: flex-end;
  `}
`;
