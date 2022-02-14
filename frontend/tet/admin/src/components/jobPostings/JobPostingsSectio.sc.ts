import styled from 'styled-components';

export const $HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const $Title = styled.h3`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: bold;
`;

export const $Total = styled.span`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: normal;
  margin-left: ${(props) => props.theme.spacing.xl};
`;
