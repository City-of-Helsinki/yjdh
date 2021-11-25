import styled from 'styled-components';

export const $FieldErrorMessage = styled.div`
  position: relative;
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.fontSize.body.m};
  margin-top: ${(props) => props.theme.spacing.xs3};
  padding-left: calc(var(--icon-size) + ${(props) => props.theme.spacing.xs2});
`;
