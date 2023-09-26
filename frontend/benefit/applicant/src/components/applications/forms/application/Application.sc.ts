import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import styled, { css } from 'styled-components';

type ViewFieldProps = {
  isInline?: boolean;
};

export const $ViewField = styled.div<ViewFieldProps>`
  &:not(:last-child) {
    padding-bottom: ${(props) =>
      props.children ? props.theme.spacing.xs4 : 0};
  }
  display: ${(props) => (props.isInline ? 'inline' : 'block')};
  font-weight: 400;
`;

export const $ViewFieldBold = styled.span`
  font-weight: 500;
`;

export const $SummaryTableHeader = styled.div`
  &:not(:last-child) {
    padding-bottom: ${(props) =>
      props.children ? props.theme.spacing.xs2 : 0};
  }
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: 500;
`;

export const $SummaryTableValue = styled.span`
  font-size: ${(props) => props.theme.fontSize.body.l};
`;

export const $KeyValueList = styled.dl``;

const CSSFormIndentation = css`
&:before {
  margin-left: -40px;
  position:absolute;
  content: '';
  display:block;
  background: ${(props) => props.theme.colors.black10};
  width: 8px;
  height 100%;
}`;

export const $SubFieldContainer = styled($GridCell)`
  margin-left: 0;
  margin-left: 50px;
  ${CSSFormIndentation}
`;
