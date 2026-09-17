import styled from 'styled-components';

export const $PaginationContainer = styled.div`
  margin-top: var(--spacing-xl);
`;

export const $LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
`;

export const $TableContainer = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const $TableWrapper = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  > div {
    width: 100%;
    min-width: fit-content;
    overflow-x: visible;
  }
`;
