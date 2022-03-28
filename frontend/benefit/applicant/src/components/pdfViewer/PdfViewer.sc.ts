import styled from 'styled-components';

export const $ViewerWrapper = styled.div<{
  documentMarginLeft: undefined | string;
}>`
  .Document {
    margin-left: ${(props) =>
      props.documentMarginLeft ? props.documentMarginLeft : '0'};
  }
  overflow: scroll;
  height: 700px;

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track:vertical {
    background: #f1f1f1;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

export const $ActionsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;
