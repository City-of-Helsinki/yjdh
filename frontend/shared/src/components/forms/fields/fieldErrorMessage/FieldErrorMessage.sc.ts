import styled from 'styled-components';

export type Props = {
  'data-testid': string;
  small?: boolean;
};

export const $FieldErrorMessage = styled.div<Props>`
  position: relative;
  color: ${(props) => props.theme.colors.error};
  font-size: ${(props) => props.theme.fontSize.body[props.small ? 's' : 'm']};
  margin-top: ${(props) => (props.small ? 0 : props.theme.spacing.xs3)};
  padding-left: calc(var(--icon-size) + ${(props) => props.theme.spacing.xs2});
  & > svg {
    position: relative;
    top: ${(props) => (props.small ? '7px' : '6px')};
    margin-right: ${(props) => props.theme.spacing.xs2};
  }
`;
