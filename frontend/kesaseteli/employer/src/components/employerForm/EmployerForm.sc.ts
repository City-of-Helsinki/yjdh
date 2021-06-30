import { PhoneInput } from 'hds-react';
import SubmitButton from 'kesaseteli/employer/components/form/SubmitButton';
import TextInput from 'kesaseteli/employer/components/form/TextInput';
import { Theme } from 'shared/styles/theme';
import styled, { ThemeProps } from 'styled-components';

type Props = ThemeProps<Theme>;

const $SubmitButton = styled(SubmitButton)`
  margin-top: ${(props: Props) => props.theme.spacing.xl};
`;

const $TextInput = styled(TextInput)`
  margin-top: ${(props: Props) => props.theme.spacing.s};
  margin-bottom: ${(props: Props) => props.theme.spacing.s};
`;

const $PhoneInput = styled(PhoneInput)`
  margin-top: ${(props: Props) => props.theme.spacing.m};
`;

export default {
  SubmitButton: $SubmitButton,
  TextInput: $TextInput,
  PhoneInput: $PhoneInput,
};
