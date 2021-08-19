import { PhoneInput } from 'hds-react';
import SubmitButton from 'kesaseteli/employer/components/form/SubmitButton';
import TextInput from 'kesaseteli/employer/components/form/TextInput';
import $ from 'styled-components';

export const $SubmitButton = $(SubmitButton)`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const $TextInput = $(TextInput)`
  margin-top: ${(props) => props.theme.spacing.s};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

export const $PhoneInput = $(PhoneInput)`
  margin-top: ${(props) => props.theme.spacing.m};
`;
