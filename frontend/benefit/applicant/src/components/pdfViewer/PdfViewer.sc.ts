import styled from 'styled-components';

export const $ViewerWrapper = styled.div<{
  documentMarginLeft: undefined | string;
}>`
  .Document {
    margin-left: ${(props) =>
      props.documentMarginLeft ? props.documentMarginLeft : 0};
  }
`;

export const $ActionsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;
