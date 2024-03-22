import styled from 'styled-components';

export const $EditorWrapper = styled.div`
  position: relative;
  overflow: scroll;
  background: #fff;
  border-radius: 7px;
  border: 1px solid grey;
`;

const EDITOR_STYLES = `
  p {
    margin-top: 0;
    line-height: 1.5;
    font-size: 18px;
  }

  h2 {
    margin-top: 0;
    font-size: 20px;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  p + h2 {
    margin-top: 30px;
  }
`;

export const $Toolbar = styled.header`
  padding: 0 0.5em;
  border-bottom: 1px solid grey;
`;

export const $Content = styled.div`
  position: relative;
  height: 100%;
  .tiptap {
    padding: 1.75em 1em 1em;
    border-radius: 0;

    ${EDITOR_STYLES}
  }
`;

export const $EditorPreview = styled.div`
  ${EDITOR_STYLES}
`;
