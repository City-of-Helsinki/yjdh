import styled from 'styled-components';

type ViewFieldBoldProps = {
  large?: boolean;
};

type ViewFieldProps = ViewFieldBoldProps & {
  isInline?: boolean;
};

export const $ViewField = styled.div<ViewFieldProps>`
  &:not(:last-child) {
    padding-bottom: ${(props) => (props.children ? props.theme.spacing.s : 0)};
  }
  display: ${(props) => (props.isInline ? 'inline' : 'block')};
  font-weight: 400;
  font-size: ${(props) =>
    props.large ? props.theme.fontSize.body.l : props.theme.fontSize.body.m};
`;

export const $ViewFieldBold = styled.div<ViewFieldBoldProps>`
  font-weight: 600;
  font-size: ${(props) =>
    props.large ? props.theme.fontSize.body.l : props.theme.fontSize.body.m};
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

export const $SummaryTableLastLine = styled.div`
  font-size: ${(props) => props.theme.fontSize.body.xl};
  background-color: ${(props) => props.theme.colors.coatOfArmsLight};
  font-weight: 600;
`;

export const $MainHeading = styled.h1`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.heading.xl};
  font-weight: normal;
`;

export const $SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const $ButtonContainer = styled.span`
  margin-right: ${(props) => props.theme.spacing.xs2};
`;
