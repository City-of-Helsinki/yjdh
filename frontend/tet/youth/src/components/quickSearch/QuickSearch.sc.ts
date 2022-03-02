import styled from 'styled-components';

export const $SearchBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  margin-top: -5rem;
  width: 95%;
  background-color: ${(props) => props.theme.colors.black60};
  padding: ${(props) => props.theme.spacing.m} ${(props) => props.theme.spacing.s};
`;
