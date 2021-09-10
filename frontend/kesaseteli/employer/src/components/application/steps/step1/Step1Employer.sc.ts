import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $EmployerBasicInfo = styled($FormGroup)`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;
