import styled from 'styled-components';

export const $Tags = styled.ul`
  margin-top: ${(props) => props.theme.spacing.m};
  display: flex;
  align-items: center;
  padding-left: 0;
  list-style: none;

  li {
    padding-right: ${(props) => props.theme.spacing.s};
  }
`;

export const $RemoveButton = styled.button`
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid transparent;
  text-decoration: underline;
  text-align: left;
  background-color: transparent;
  cursor: pointer;
`;
