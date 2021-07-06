import { PhoneInput } from 'hds-react';
import SubmitButton from 'kesaseteli/employer/components/form/SubmitButton';
import TextInput from 'kesaseteli/employer/components/form/TextInput';
import styled from 'styled-components';

const StyledSubmitButton = styled(SubmitButton)`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

const StyledTextInput = styled(TextInput)`
  margin-top: ${(props) => props.theme.spacing.s};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;

const StyledPhoneInput = styled(PhoneInput)`
  margin-top: ${(props) => props.theme.spacing.m};
`;

export { StyledPhoneInput, StyledSubmitButton, StyledTextInput };
