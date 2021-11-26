import styled from 'styled-components';

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
