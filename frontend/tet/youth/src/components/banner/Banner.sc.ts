import styled from 'styled-components';

export const $Banner = styled.ul`
  margin-top: ${(props) => props.theme.spacing.m};
  background-color: ${(props) => props.theme.colors.suomenlinna};
  height: 500px;
`;

export const $Title = styled.h1`
  width: 50%;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.white};
`;
