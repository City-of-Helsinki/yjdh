import {
  $Grid,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import styled, { DefaultTheme } from 'styled-components';

type DeMinimisGridProps = {
  $bgColor?: string;
  theme: DefaultTheme;
};

export const $DeMinimisSubHeader = styled($SubHeader)`
  margin-top: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs3};
  margin-bottom: ${(props: { theme: DefaultTheme }) => props.theme.spacing.s};
  margin-left: ${(props: { theme: DefaultTheme }) => props.theme.spacing.xs2};
  white-space: pre-line;
  font-weight: 400;
  font-size: 1.1em;
`;

export const $DeMinimisGrid = styled($Grid)<DeMinimisGridProps>`
  max-width: 1024px;
  margin-left: calc(
    -1 * ${(props: DeMinimisGridProps) => props.theme.spacing.s}
  );
  padding: ${(props: DeMinimisGridProps) => props.theme.spacing.xs2}
    ${(props: DeMinimisGridProps) => props.theme.spacing.m};
  margin-bottom: ${(props: DeMinimisGridProps) => props.theme.spacing.xs2};
  background: ${(props: DeMinimisGridProps) =>
    props.$bgColor ? props.$bgColor : props.theme.colors.black10};

  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }

  > * {
    justify-content: space-between;
    flex-flow: row wrap;
  }
`;

export const $DeMinimisGridForm = styled($DeMinimisGrid)<DeMinimisGridProps>`
  padding: ${(props: DeMinimisGridProps) => props.theme.spacing.m};
  margin-left: calc(
    -1 * ${(props: DeMinimisGridProps) => props.theme.spacing.s}
  );
  background: ${(props: DeMinimisGridProps) =>
    props.$bgColor ? props.$bgColor : props.theme.colors.black10};
`;
