import { IconCheckCircle } from 'hds-react';
import styled, { DefaultTheme } from 'styled-components';

type ColorKeys = keyof DefaultTheme['colors'];
export type ColorValue = DefaultTheme['colors'][ColorKeys];

export type ReviewSectionWrapperProps = {
  withAction?: boolean;
  bgColor?: ColorValue;
};

export const $Wrapper = styled.div<ReviewSectionWrapperProps>`
  background-color: ${(props) => (props.bgColor ? props.bgColor : '')};
  display: ${(props) => (props.withAction ? 'flex' : '')};
  flex-direction: ${(props) => (props.withAction ? 'column' : '')};
  margin-bottom: ${(props) => (props.withAction ? props.theme.spacing.s : '')};
`;

export const $WrapperInner = styled.div<ReviewSectionWrapperProps>`
  background-color: ${(props) => (props.bgColor ? props.bgColor : '')};
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
  padding-left: 102px;
`;
