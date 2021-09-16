import { Button } from 'hds-react';
import FormSection from 'shared/components/forms/section/FormSection';
import styled from 'styled-components';

export const $ButtonSection = styled(FormSection)`
  margin-top: ${(props) => props.theme.spacing.m};
  padding-bottom: ${(props) => props.theme.spacing.m};
`;
export const $SecondaryButton = styled(Button)`
  color: ${(props) => props.theme.colors.black90} !important;
  border-color: ${(props) => props.theme.colors.black90} !important;
  border-width: 3px !important;
  min-width: 170px;
  max-height: 60px;
`;

export const $PrimaryButton = styled(Button)`
  border-width: 3px !important;
  width: 255px;
`;

