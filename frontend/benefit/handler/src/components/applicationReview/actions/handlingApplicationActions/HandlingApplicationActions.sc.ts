import styled from 'styled-components';

export const $Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const $Column = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.s};
`;

export const $CustomNotesActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
