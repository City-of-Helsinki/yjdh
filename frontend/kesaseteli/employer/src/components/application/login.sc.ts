import { Button, Notification } from 'hds-react';
import styled from 'styled-components';

export const $PrimaryButton = styled(Button)`
  background-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-color: ${(props) => props.theme.colors.coatOfArms} !important;
  border-width: 3px !important;
`;

export const $Notification = styled(Notification)`
  font-size: ${(props) => props.theme.fontSize.body.s};
  line-height: ${(props) => props.theme.lineHeight.xl};
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;
