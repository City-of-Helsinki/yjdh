import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type CalculatorTableRowProps = {
  isTotal?: boolean;
};

export const $ActionsWrapper = styled.div`
  margin: ${(props) => props.theme.spacing.s};
  margin-left: 0;
`;

export const $CalculatorText = styled.p`
  margin-top: 0;
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $CalculatorHr = styled($Hr)`
  margin-top: ${(props) => props.theme.spacing.xs};
  margin-bottom: ${(props) => props.theme.spacing.m};
  border-top: 1px solid ${(props) => props.theme.colors.coatOfArms};
`;

export const $ResetDatesWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const $ResetLink = styled.a`
  width: 100%;
  display: inline-block;
  text-align: end;
  vertical-align: middle;
  text-decoration: none;
  color: ${(props) => props.theme.colors.black50};
  font-size: ${(props) => props.theme.fontSize.body.m};
`;

export const $CalculatorTableRow = styled.div<CalculatorTableRowProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme: { spacing } }) => `${spacing.xs3} ${spacing.xs}`};
  background-color: ${(props) =>
    props.isTotal ? props.theme.colors.white : ''};
`;
