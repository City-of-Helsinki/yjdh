import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import styled, { DefaultTheme } from 'styled-components';

type ReviewGridProps = {
  border?: string;
  theme: DefaultTheme;
};

export const $ReviewGrid = styled($Grid)<ReviewGridProps>`
  box-sizing: border-box;
  margin-bottom: ${(props: ReviewGridProps) => props.theme.spacing.m};
  gap: 0;
  padding: ${(props: ReviewGridProps) => props.theme.spacing.l};
  border: ${(props: ReviewGridProps) =>
    props.border ? `2px solid ${props.border}` : '0'};
`;
