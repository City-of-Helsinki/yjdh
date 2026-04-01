import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import styled, { DefaultTheme } from 'styled-components';

export const $EmploymentFieldSummary = styled($GridCell)`
  font-size: ${(props: { theme: DefaultTheme }) => props.theme.fontSize.body.l};
`;
