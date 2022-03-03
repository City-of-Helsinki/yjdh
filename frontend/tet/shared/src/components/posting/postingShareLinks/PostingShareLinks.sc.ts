import styled from 'styled-components';

export const $ShareTitle = styled.div`
  margin-top: ${(props) => props.theme.spacing.xl4};
  margin-bottom: ${(props) => props.theme.spacing.s};
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  font-weight: bold;
`;

export const $Links = styled.div`
  display: flex;
  flex-flow: row nowrap;
`;

export const $ShareButton = styled.div`
  cursor: pointer;
  margin-right: ${(props) => props.theme.spacing.s};
`;
