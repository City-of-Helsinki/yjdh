import { IconCheckCircle } from 'hds-react';
import styled from 'styled-components';

export type ReviewSectionWrapperProps = {
  withAction?: boolean;
};

export const $Wrapper = styled.div<ReviewSectionWrapperProps>`
  background-color: ${(props) =>
    props.withAction ? props.theme.colors.silverLight : ''};
  display: ${(props) => (props.withAction ? 'flex' : '')};
  flex-direction: ${(props) => (props.withAction ? 'column' : '')};
`;

export const $WrapperInner = styled.div<ReviewSectionWrapperProps>`
  background-color: ${(props) =>
    props.withAction ? props.theme.colors.silverLight : ''};
  display: ${(props) => (props.withAction ? 'flex' : '')};
`;

export const $ActionLeft = styled.div`
  width: 102px;
`;

export const $CheckIcon = styled(IconCheckCircle)`
  padding-top: 20px;
  padding-left: ${(props) => props.theme.spacing.s};
`;

export const $ActionBottom = styled.div`
  background-color: ${(props) => props.theme.colors.silver};
  padding: ${(props) => props.theme.spacing.s};
  padding-left: 102px;
`;
