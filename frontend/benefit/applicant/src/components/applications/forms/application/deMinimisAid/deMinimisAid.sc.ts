import {
  $Grid,
  $SubHeader,
} from 'shared/components/forms/section/FormSection.sc';
import styled from 'styled-components';

type DeMinimisGridProps = {
  $bgColor?: string;
};

export const $DeMinimisSubHeader = styled($SubHeader)`
  margin-top: ${(props) => props.theme.spacing.xs3};
  margin-bottom: ${(props) => props.theme.spacing.s};
  margin-left: ${(props) => props.theme.spacing.xs2};
  font-weight: 400;
  font-size: 1.1em;
`;

export const $DeMinimisGrid = styled($Grid)<DeMinimisGridProps>`
  max-width: 1024px;
  margin-left: calc(-1 * ${(props) => props.theme.spacing.s});
  padding: ${(props) => props.theme.spacing.xs2}
    ${(props) => props.theme.spacing.m};
  margin-bottom: ${(props) => props.theme.spacing.xs2};
  background: ${(props) =>
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
  padding: ${(props) => props.theme.spacing.m};
  margin-left: calc(-1 * ${(props) => props.theme.spacing.s});
  background: ${(props) =>
    props.$bgColor ? props.$bgColor : props.theme.colors.black10};
`;
