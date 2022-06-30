import styled from 'styled-components';

export const $BackButton = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: normal;
`;
