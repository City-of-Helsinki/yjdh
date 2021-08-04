import $ from 'styled-components';

export const $Heading = $.h2`
  font-size: ${(props) => props.theme.fontSize.heading.m};
  font-weight: 500;
`;

export const $ListWrapper = $.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs2};
  list-style: none;
  padding: 0;
  margin: 0;
  margin-bottom: ${(props) => props.theme.spacing.l};
`;
