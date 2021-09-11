import { Button } from 'hds-react';
import { $FormGroup } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $AccordionHeader = styled.div<{ displayError: boolean }>`
  ${(props) =>
    props.displayError ? `background: ${props.theme.colors.errorLight};` : ''}
`;

export const $AccordionContent = styled.div`
  background: ${(props) => props.theme.colors.black5};
  border: 1px solid ${(props) => props.theme.colors.silverDark};
  margin-top: ${(props) => props.theme.spacing.m};
`;

export const $EmploymentInputGrid = styled($FormGroup)`
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: ${({ theme: { spacing } }) => spacing.xl2};
  margin: ${({ theme: { spacing } }) =>
    `${spacing.s} ${spacing.l} ${spacing.s} ${spacing.s}`};
  padding-right: ${({ theme: { spacing } }) => spacing.l};
`;

export const $SupplementaryButton = styled(Button)``;

export const $EmploymentActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin: ${(props) => props.theme.spacing.l};
`;

export const $EmploymentAction = styled.div`
  display: flex;
  flex-direction: column;
`;

export const $AccordionHeaderText = styled.span``;

export const $ErrorIconContainer = styled.span`
  color: ${(props) => props.theme.colors.error};
  margin-left: ${(props) => props.theme.spacing.xs};
`;
