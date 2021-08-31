import { PhoneInput } from 'hds-react';
import ApplicationActions from 'kesaseteli/employer/components/application/ApplicationActions';
import TextInput from 'kesaseteli/employer/components/application/form/TextInput';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $ActionButtons = styled(ApplicationActions)`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

export const $TextInput = styled(TextInput)`
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

export const $PhoneInput = styled(PhoneInput)`
  margin-top: ${(props) => props.theme.spacing.m};
`;

export const $EmployerBasicInfoGrid = styled($FormGroup)`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;

