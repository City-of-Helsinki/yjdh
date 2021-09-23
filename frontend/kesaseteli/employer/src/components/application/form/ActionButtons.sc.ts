import styled from 'styled-components';

export const $ApplicationActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => props.theme.spacing.l};
`;

export const $ApplicationAction = styled.div`
  display: flex;
  flex-direction: column;
`;
