import styled from 'styled-components';

export const $Bar = styled.div`
  background-color: ${(props) => props.theme.colors.alert};
`;

export const $BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  font-weight: medium;
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  align-items: center;
  text-decoration: none;
  color: inherit;
`;

export const $PreviewText = styled.span`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  text-transform: uppercase;
  font-weight: normal;
`;

export const $BarWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: -${(props) => props.theme.spacing.xs};
`;
