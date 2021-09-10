import styled from 'styled-components';

export interface FieldLabelProps {
  required?: boolean;
  value?: string;
}

export const $Content = styled.div<FieldLabelProps>`
  font-size: ${(props) => props.theme.fontSize.body.m};
  font-weight: 500;
  margin-bottom: ${(props) => props.theme.spacing.m};
`;

export const $Required = styled.span<FieldLabelProps>`
  display: inline-block;
  font-size: ${(props) => props.theme.fontSize.body.xl};
  margin-left: ${(props) => props.theme.spacing.xs2};
  line-height: 1;
  transform: translateY(${(props) => props.theme.spacing.xs3});
`;
