import { Button } from 'hds-react';
import Accordion from 'shared/components/accordion/Accordion';
import FormSection from 'shared/components/forms/section/FormSection';
import styled from 'styled-components';

export const $AccordionHeader = styled.div<{ displayError: boolean }>`
  ${(props) =>
    props.displayError ? `background: ${props.theme.colors.errorLight};` : ''}
  margin: ${({ theme: { spacing } }) => `${spacing.s} ${spacing.l} ${spacing.s} ${spacing.l}`};
`;

export const $Accordion = styled(Accordion)`
  border: 1px solid ${({ theme: { colors } }) => colors.black50};
  `
export const $AccordionFormSection = styled(FormSection)`
  background: ${(props) => props.theme.colors.black5};
  border: 0px;
  padding: ${({ theme: { spacing } }) => `${spacing.s} ${spacing.s} ${spacing.s} ${spacing.s}`};
  column-gap: ${({ theme: { spacing } }) => spacing.xl2};
`;

export const $SupplementaryButton = styled(Button)``;

export const $AccordionHeaderText = styled.span``;

export const $ErrorIconContainer = styled.span`
  color: ${(props) => props.theme.colors.error};
  margin-left: ${(props) => props.theme.spacing.xs};
`;
