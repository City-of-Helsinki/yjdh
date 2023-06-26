import styled from 'styled-components';

export const $ViewerWrapper = styled.div`
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.1);
  .Document {
    min-height: 100%;
    height: 100%;
  }
  height: 100%;

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
