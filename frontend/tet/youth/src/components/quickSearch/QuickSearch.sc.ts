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
  padding: ${(props) => props.theme.spacing.xl2} ${(props) => props.theme.spacing.m};
`;

export const $SearchText = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-size: ${(props) => props.theme.fontSize.body.xl};
  font-weight: bold;
`;

export const $Filters = styled.div`
  display: inline-flex;
  width: 80%;
  color: ${(props) => props.theme.colors.white};
  font-size: ${(props) => props.theme.fontSize.body.l};
  font-weight: bold;
`;

export const $SearchField = styled.div`
  width: 55%;
  padding-right: ${(props) => props.theme.spacing.s};
`;

export const $DateField = styled.div`
  width: 25%;
  padding-right: ${(props) => props.theme.spacing.s};
`;

export const $ButtonContainer = styled.div`
  flex-grow: 1;
`;
