import styled from 'styled-components';

export const $Hr = styled.hr`
  border: none;
  border-top: 1px solid ${(props) => props.theme.colors.black20};
  margin-top: ${(props) => props.theme.spacing.l};
  margin-bottom: ${(props) => props.theme.spacing.l};
  width: 100%;
`;

export const $H1 = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.l};
  font-weight: 300;
`;

export const $P = styled.p`
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $H2 = styled.h2`
  font-size: ${(props) => props.theme.fontSize.heading.s};
  font-weight: 700;
`;
