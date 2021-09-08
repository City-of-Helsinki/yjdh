import { Accordion } from 'hds-react';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $Accordion = styled(Accordion)`
`;

export const $EmploymentFormGrid = styled($FormGroup)`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  grid-gap: ${(props) => props.theme.spacing.xs};
`;
