import styled from 'styled-components';

export const $HeadingContainer = styled.div`
  display: flex;
  box-sizing: border-box;
`;

export const $Heading = styled.h1`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;
