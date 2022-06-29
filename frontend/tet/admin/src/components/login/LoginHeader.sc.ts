import styled from 'styled-components';

export const $LoginHeader = styled.div`
  background-color: ${(props) => props.theme.colors.silverLight};
  padding-top: ${(props) => props.theme.spacing.xl};
  padding-bottom: ${(props) => props.theme.spacing.xl};
`;
export const $LoginHeaderTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.l};
`;
export const $LoginHeaderSubtitle = styled.div`
  margin-top: ${(props) => props.theme.spacing.l};
  font-size: ${(props) => props.theme.fontSize.body.l};
`;
