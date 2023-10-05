import {
  $Grid,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

export const $DeMinimisSubHeader = styled($SubHeader)`
  margin-top: ${(props) => props.theme.spacing.xs3};
  margin-bottom: ${(props) => props.theme.spacing.s};
  margin-left: ${(props) => props.theme.spacing.xs2};
  font-weight: 400;
  font-size: 1.1em;
`;

export const $DeMinimisGrid = styled($Grid)`
  max-width: 1024px;
  margin-left: calc(-1 * ${(props) => props.theme.spacing.s});
  padding-left: ${(props) => props.theme.spacing.m};
  padding-right: ${(props) => props.theme.spacing.m};
`;

type DeMinimisGridProps = {
  $bgColor?: string;
};

export const $DeMinimisGridPadded = styled($DeMinimisGrid)<DeMinimisGridProps>`
  padding: ${(props) => props.theme.spacing.m};
  margin-left: calc(-1 * ${(props) => props.theme.spacing.s});
  background: ${(props) =>
    props.$bgColor ? props.$bgColor : props.theme.colors.black10};
  margin-bottom: ${(props) => props.theme.spacing.s};
`;
