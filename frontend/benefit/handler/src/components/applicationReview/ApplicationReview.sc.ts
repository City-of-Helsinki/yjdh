import { Link } from 'hds-react';
import { $Hr } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type CalculatorTableRowProps = {
  isTotal?: boolean;
  isNewSection?: boolean;
};

type CalculatorTextProps = {
  isBold?: boolean;
};

type TabButtonProps = {
  active?: boolean;
};

export const $ApplicationModify = styled.div`
  z-index: 2;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  position: relative;
  flex-direction: column;
`;

export const $ApplicationReview = styled($ApplicationModify)`
  padding: ${(props) => props.theme.spacing.xl2} 0 0;
  hr {
    border: 1px solid ${(props) => props.theme.colors.silver};
  }
`;

export const $ApplicationReviewLocked = styled.div`
  position: absolute;
  z-index: 100;
  width: 100%;
  height: calc(100% + ${(props) => props.theme.spacing.xl});
  top: calc(-1 * ${(props) => props.theme.spacing.xl});
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.175);
`;

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

export const $CalculatorHeader = styled.p`
  margin-bottom: ${(props) => props.theme.spacing.xs};
  font-size: ${(props) => props.theme.fontSize.heading.s};
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
  margin-top: ${(props) => (props.isNewSection ? props.theme.spacing.m : '0')};
`;

export const $RowWrap = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

export const $CalculatorTableHeader = styled.div`
  font-size: ${(props) => props.theme.fontSize.heading.l};
  padding: ${({ theme: { spacing } }) => `${spacing.xs3} ${spacing.xs}`};
`;

export const $TabButton = styled.span<TabButtonProps>`
  display: inline-block;
  cursor: pointer;
  align-items: center;
  padding-bottom: ${(props) => props.theme.spacing.xs2};
  width: 50%;
  font-weight: 500;
  text-align: center;
  user-select: none;
  border-bottom: ${(props) =>
    props.active ? '4px solid black' : '1px solid gray'};
`;

export const $HelpText = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.black70};
`;

export const $RadioButtonContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.coatOfArmsMediumLight};
  padding: ${(props) => props.theme.spacing.s};
  background-color: ${(props) => props.theme.colors.white};
`;

export const $Highlight = styled.div`
  border-left: 8px solid ${(props) => props.theme.colors.coatOfArms};
  padding-left: ${(props) => props.theme.spacing.l};
  margin: ${(props) => props.theme.spacing.xs};
  line-height: ${(props) => props.theme.lineHeight.l};
`;

export const $NoticeBar = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  z-index: 99;
  padding: ${(props) => props.theme.spacing.s};
  max-width: 100%;
  background-color: ${(props) => props.theme.colors.summerMediumLight};
  text-align: center;
  font-size: ${(props) => props.theme.fontSize.body.l};
  svg {
    padding-left: ${(props) => props.theme.spacing.xs};
  }
`;
