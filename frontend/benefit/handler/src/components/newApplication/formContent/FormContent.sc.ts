import styled from 'styled-components';

export const $Description = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.xs};
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $DateHeader = styled.p`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 500;
`;
