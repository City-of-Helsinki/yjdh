import { PhoneInput } from 'hds-react';
import SubmitButton from 'kesaseteli/employer/components/form/SubmitButton';
import TextInput from 'kesaseteli/employer/components/form/TextInput';
import styled from 'styled-components';

export const $SubmitButton = styled(SubmitButton)`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const $TextInput = styled(TextInput)`
  margin-top: ${(props) => props.theme.spacing.s};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

export const $PhoneInput = styled(PhoneInput)`
  margin-top: ${(props) => props.theme.spacing.m};
`;
