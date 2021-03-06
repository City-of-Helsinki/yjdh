import { Link } from 'hds-react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type CalculatorTableRowProps = {
  isTotal?: boolean;
};

type CalculatorTextProps = {
  isBold?: boolean;
};

export const $MainHeader = styled.h1`
  font-size: ${(props) => props.theme.fontSize.heading.m};
`;

export const $ActionsWrapper = styled.div`
  margin: ${(props) => props.theme.spacing.s};
  margin-left: 0;
`;

export const $CalculatorText = styled.p<CalculatorTextProps>`
  margin: 0;
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: ${(props) => (props.isBold ? 'bold' : '500')};
`;

export const $FieldHeaderText = styled.p`
  margin-bottom: 0;
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $CalculatorHr = styled($Hr)`
  margin-top: ${(props) => props.theme.spacing.xs};
  margin-bottom: ${(props) => props.theme.spacing.m};
  border-top: 1px solid ${(props) => props.theme.colors.coatOfArms};
`;

export const $ResetDatesWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
  height: 100%;
  color: ${(props) => props.theme.colors.black50};
`;

export const $ResetLink = styled(Link)`
  display: inline-block;
  text-align: end;
  vertical-align: middle;
  text-decoration: none;
  font-size: ${(props) => props.theme.fontSize.body.m};
  padding-left: ${(props) => props.theme.spacing.xs2};
  cursor: pointer;
  color: ${(props) => props.theme.colors.black50};
  &:visited {
    color: ${(props) => props.theme.colors.black50};
  }
`;

export const $CalculatorTableRow = styled.div<CalculatorTableRowProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme: { spacing } }) => `${spacing.xs3} ${spacing.xs}`};
  background-color: ${(props) =>
    props.isTotal ? props.theme.colors.white : ''};
  margin-bottom: ${(props) => (props.isTotal ? props.theme.spacing.m : '0')};
`;
