import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type ReviewGridProps = {
  border?: string;
};

export const $ReviewGrid = styled($Grid)<ReviewGridProps>`
  box-sizing: border-box;
  margin-bottom: ${(props) => props.theme.spacing.m};
  gap: 0;
  padding: ${(props) => props.theme.spacing.l};
  border: ${(props) => (props.border ? `2px solid ${props.border}` : '0')};
`;
