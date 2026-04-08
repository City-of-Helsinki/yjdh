import React from 'react';
import styled, { DefaultTheme } from 'styled-components';

export type Props = {
  children?: React.ReactNode;
  'data-testid': string;
  small?: boolean;
};

export const $FieldErrorMessage = styled.div<Props>`
  position: relative;
  color: ${(props: { theme: DefaultTheme } & Props) => props.theme.colors.error};
  font-size: ${(props: { theme: DefaultTheme } & Props) =>
    props.theme.fontSize.body[props.small ? 's' : 'm']};
  margin-top: ${(props: { theme: DefaultTheme } & Props) =>
    props.small ? 0 : props.theme.spacing.xs3};
  padding-left: calc(
    var(--icon-size) +
      ${(props: { theme: DefaultTheme } & Props) => props.theme.spacing.xs2}
  );
  & > svg {
    position: relative;
    top: ${(props: { theme: DefaultTheme } & Props) =>
      props.small ? '7px' : '6px'};
    margin-right: ${(props: { theme: DefaultTheme } & Props) =>
      props.theme.spacing.xs2};
  }
`;
