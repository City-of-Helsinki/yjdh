import styled from 'styled-components';

export const $ViewField = styled.div`
  &:not(:last-child) {
    padding-bottom: ${(props) =>
      props.children ? props.theme.spacing.xs2 : 0};
  }
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;
